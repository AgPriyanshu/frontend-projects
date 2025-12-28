/**
 * MapStore - Root store that coordinates data, viewport, and map instance
 *
 * Responsibilities:
 * - Coordinate sub-stores (DataStore, ViewportStore)
 * - Manage map instance lifecycle
 * - Synchronize state between stores and map instance
 * - Provide high-level convenience methods
 */

import {
  makeAutoObservable,
  autorun,
  reaction,
  runInAction,
  type IReactionDisposer,
} from "mobx";
import type {
  Map as MapLibreMap,
  LngLatLike,
  LngLatBoundsLike,
} from "maplibre-gl";
import { StateManager } from "./state-manager/state-manager";
import { ViewportManager } from "./viewport-store";

export class WorkspaceManager {
  // ===== Sub-stores =====
  stateManager = new StateManager();
  viewportManager = new ViewportManager();

  // ===== Map Instance =====
  private mapInstance: MapLibreMap | null = null;

  // ===== State =====
  isMapReady = false;
  isLoading = false;
  error: string | null = null;

  // ===== Sync Disposers =====
  private disposers: IReactionDisposer[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  // ===== Map Instance Management =====

  /**
   * Register the MapLibre instance and setup synchronization
   */
  setMapInstance(map: MapLibreMap) {
    if (this.mapInstance) {
      console.warn("Map instance already set. Cleaning up previous instance.");
      this.clearMapInstance();
    }

    this.mapInstance = map;
    this.isMapReady = true;
    this.error = null;

    // Setup bidirectional synchronization
    this.setupBidirectionalSync();
  }

  /**
   * Get the current map instance (read-only access)
   */
  getMapInstance(): MapLibreMap | null {
    return this.mapInstance;
  }

  /**
   * Clear map instance and cleanup
   */
  clearMapInstance() {
    // Dispose all reactions
    this.disposers.forEach((dispose) => dispose());
    this.disposers = [];

    this.mapInstance = null;
    this.isMapReady = false;
  }

  // ===== Synchronization Setup =====

  private setupBidirectionalSync() {
    if (!this.mapInstance) return;

    this.importBaseStyleLayers();

    // 1. Map events → Store state
    this.syncMapEventsToStore();

    // 2. Store state → Map updates
    this.syncStoreToMap();
  }

  // ===== Map Events → Store ===== (Read from Map to Store)
  private syncMapEventsToStore() {
    if (!this.mapInstance) return;

    const map = this.mapInstance;

    // Viewport changes
    const updateViewport = () => {
      if (!map) return;

      const center = map.getCenter();
      runInAction(() => {
        console.log("Syncing viewport to store from map...");
        this.viewportManager.setViewport({
          center: [center.lng, center.lat],
          zoom: map.getZoom(),
          bearing: map.getBearing(),
          pitch: map.getPitch(),
        });
      });
    };

    map.on("move", updateViewport);
    map.on("zoom", updateViewport);
    map.on("rotate", updateViewport);
    map.on("pitch", updateViewport);

    // Map load state
    map.on("load", () => {
      runInAction(() => {
        console.log("Map loaded...");
        this.isMapReady = true;
      });
    });

    // Loading states
    map.on("dataloading", () => {
      runInAction(() => {
        console.log("Map loading...");
        this.isLoading = true;
      });
    });

    map.on("idle", () => {
      runInAction(() => {
        this.isLoading = false;
      });
    });

    // Error handling
    map.on("error", (e) => {
      runInAction(() => {
        this.error = e.error?.message || "Map error occurred";
      });
      console.error("Map error:", e);
    });
  }

  // ===== Store State → Map =====

  private syncStoreToMap() {
    if (!this.mapInstance) return;

    // Combined sync: sources first, then layers (ensures proper order)
    const sourcesAndLayersDisposer = autorun(() => {
      console.log("Syncing store to map for source and layers...");
      if (!this.mapInstance || !this.isMapReady) return;

      // 1. Sync sources to map FIRST
      // this.dataManager.sources.forEach((source, sourceId) => {
      //   if (!this.mapInstance!.getSource(sourceId)) {
      //     try {
      //       this.mapInstance!.addSource(sourceId, {
      //         type: source.type,
      //         data: source.data,
      //         // url: source.url,
      //         // tiles: source.tiles,
      //         // attribution: source.attribution,
      //         // bounds: source.bounds,
      //         // minzoom: source.minzoom,
      //         // maxzoom: source.maxzoom,
      //         // tileSize: source.tileSize,
      //       } as any);
      //     } catch (error) {
      //       console.error(`Failed to add source ${sourceId}:`, error);
      //     }
      //   }
      // });

      // 2. Sync layers to map AFTER sources
      const mapLayerIds = new Set(
        this.mapInstance!.getStyle()?.layers?.map((l) => l.id) || []
      );

      // Add new layers from store in correct order
      // this.dataManager.layerOrder.forEach((layerId) => {
      //   const layer = this.dataManager.layers.get(layerId);
      //   if (!layer || mapLayerIds.has(layerId)) return;

      //   // Check if source exists on map before adding layer
      //   if (!this.mapInstance!.getSource(layer.sourceId)) {
      //     console.warn(
      //       `Skipping layer "${layerId}": source "${layer.sourceId}" not yet available on map`
      //     );
      //     return;
      //   }

      //   try {
      //     const layerConfig: any = {
      //       id: layer.id,
      //       source: layer.sourceId,
      //       type: layer.type,
      //       paint: layer.paint,
      //       layout: {
      //         ...layer.layout,
      //         visibility: layer.visible ? "visible" : "none",
      //       },
      //     };

      //     // Only add optional properties if they are defined
      //     if (layer.sourceLayer)
      //       layerConfig["source-layer"] = layer.sourceLayer;
      //     if (layer.minZoom !== undefined) layerConfig.minzoom = layer.minZoom;
      //     if (layer.maxZoom !== undefined) layerConfig.maxzoom = layer.maxZoom;
      //     if (layer.filter) layerConfig.filter = layer.filter;
      //     if (layer.metadata) layerConfig.metadata = layer.metadata;

      //     this.mapInstance!.addLayer(layerConfig);
      //   } catch (error) {
      //     console.error(`Failed to add layer ${layerId}:`, error);
      //   }
      // });

      // Remove layers that are no longer in store
      mapLayerIds.forEach((mapLayerId) => {
        if (!this.stateManager.layers.has(mapLayerId)) {
          try {
            this.mapInstance!.removeLayer(mapLayerId);
          } catch (error) {
            console.error(`Failed to remove layer ${mapLayerId}:`, error);
          }
        }
      });
    });

    this.disposers.push(sourcesAndLayersDisposer);

    // Sync layer visibility changes
    const visibilityDisposer = reaction(
      () =>
        this.stateManager
          .getVisibleLayers()
          .map((layer) => ({ id: layer.id, visible: layer.visible })),
      () => {
        console.log("Syncing store to map for layer visibility...");
        if (!this.mapInstance || !this.isMapReady) return;

        this.stateManager.layers.forEach((layer, layerId) => {
          if (this.mapInstance!.getLayer(layerId)) {
            try {
              const visibility = layer.visible ? "visible" : "none";
              this.mapInstance!.setLayoutProperty(
                layerId,
                "visibility",
                visibility
              );
            } catch (error) {
              console.error(
                `Failed to update visibility for layer ${layerId}:`,
                error
              );
            }
          }
        });
      }
    );
    this.disposers.push(visibilityDisposer);

    const opacityDisposer = reaction(
      () =>
        Array.from(this.stateManager.layers.values()).map((layer) => ({
          id: layer.id,
          opacity: layer.opacity,
          type: layer.type,
        })),
      (layers: Array<{ id: string; opacity: number; type: string }>) => {
        console.log("Syncing store to map for layer opacity...");
        if (!this.mapInstance || !this.isMapReady) return;

        layers.forEach((layer: { id: string; opacity: number; type: string }) => {
          if (this.mapInstance!.getLayer(layer.id)) {
            try {
              const opacityProp = this.getOpacityProperty(layer.type);
              if (opacityProp) {
                this.mapInstance!.setPaintProperty(
                  layer.id,
                  opacityProp,
                  layer.opacity
                );
              }
            } catch (error) {
              console.error(
                `Failed to update opacity for layer ${layer.id}:`,
                error
              );
            }
          }
        });
      }
    );
    this.disposers.push(opacityDisposer);

    // Sync GeoJSON source data updates
    const dataUpdatesDisposer = autorun(() => {
      if (!this.mapInstance || !this.isMapReady) return;

      this.stateManager.sources.forEach((source, sourceId) => {
        if (source.type === "geojson" && source.data) {
          const mapSource = this.mapInstance!.getSource(sourceId);
          if (mapSource && mapSource.type === "geojson") {
            try {
              (mapSource as any).setData(source.data);
            } catch (error) {
              console.error(
                `Failed to update data for source ${sourceId}:`,
                error
              );
            }
          }
        }
      });
    });
    this.disposers.push(dataUpdatesDisposer);
  }

  /**
   * Get the opacity property name for a layer type
   */
  private getOpacityProperty(layerType: string): string | null {
    const opacityMap: Record<string, string> = {
      fill: "fill-opacity",
      line: "line-opacity",
      circle: "circle-opacity",
      symbol: "icon-opacity",
      raster: "raster-opacity",
      heatmap: "heatmap-opacity",
      "fill-extrusion": "fill-extrusion-opacity",
      hillshade: "hillshade-shadow-color", // Note: hillshade doesn't have opacity
    };
    return opacityMap[layerType] || null;
  }

  private importBaseStyleLayers() {
    if (!this.mapInstance) return;

    const style = this.mapInstance.getStyle();
    if (!style) return;

    // Import sources
    if (style.sources) {
      Object.entries(style.sources).forEach(([sourceId, sourceConfig]) => {
        console.log({ sourceId, sourceConfig });
        if (!this.stateManager.sources.has(sourceId)) {
          this.stateManager.addSource({
            id: sourceId,
            type: sourceConfig.type as any,
            data: (sourceConfig as any).data,
            url: (sourceConfig as any).url,
            tiles: (sourceConfig as any).tiles,
            attribution: (sourceConfig as any).attribution,
            bounds: (sourceConfig as any).bounds,
            minzoom: (sourceConfig as any).minzoom,
            maxzoom: (sourceConfig as any).maxzoom,
            tileSize: (sourceConfig as any).tileSize,
          });
        }
      });
    }

    // Import layers
    if (style.layers) {
      style.layers.forEach((layer: any) => {
        if (!this.stateManager.layers.has(layer.id) && layer.source) {
          this.stateManager.addLayer({
            id: layer.id,
            sourceId: layer.source || "",
            type: layer.type,
            sourceLayer: layer["source-layer"],
            paint: layer.paint || {},
            layout: layer.layout || {},
            filter: layer.filter,
            minZoom: layer.minzoom,
            maxZoom: layer.maxzoom,
            visible: layer.layout?.visibility !== "none",
            opacity: 1, // Default opacity
            metadata: {
              ...layer.metadata,
              isBaseLayer: true, // Mark as base layer
            },
          });
        }
      });
    }

    console.log(
      `📥 Imported ${this.stateManager.sourceCount} sources and ${this.stateManager.layerCount} layers from base style`
    );
  }
  // ===== Convenience Methods =====

  /**
   * Fly to a location with animation
   */
  flyTo(
    center: [number, number],
    zoom?: number,
    options?: { duration?: number; bearing?: number; pitch?: number }
  ) {
    if (!this.mapInstance) {
      console.warn("Map instance not ready");
      return;
    }

    this.mapInstance.flyTo({
      center: center as LngLatLike,
      zoom: zoom ?? this.viewportManager.zoom,
      duration: options?.duration ?? 1000,
      bearing: options?.bearing,
      pitch: options?.pitch,
    });
  }

  /**
   * Fit map to bounds
   */
  fitBounds(
    bounds: [[number, number], [number, number]],
    options?: { padding?: number; maxZoom?: number }
  ) {
    if (!this.mapInstance) {
      console.warn("Map instance not ready");
      return;
    }

    this.mapInstance.fitBounds(bounds as LngLatBoundsLike, {
      padding: options?.padding ?? 50,
      maxZoom: options?.maxZoom,
    });
  }

  /**
   * Jump to location without animation
   */
  jumpTo(center: [number, number], zoom?: number) {
    if (!this.mapInstance) {
      console.warn("Map instance not ready");
      return;
    }

    this.mapInstance.jumpTo({
      center: center as LngLatLike,
      zoom: zoom ?? this.viewportManager.zoom,
    });
  }

  /**
   * Reset map to initial state
   */
  resetMap() {
    this.viewportManager.reset();
    this.stateManager.clear();
    this.error = null;
  }

  /**
   * Resize map (call after container size changes)
   */
  resize() {
    if (this.mapInstance) {
      this.mapInstance.resize();
    }
  }

  // ===== Cleanup =====

  /**
   * Dispose the store and cleanup resources
   */
  dispose() {
    this.clearMapInstance();
    this.stateManager.clear();
    this.viewportManager.reset();
  }
}

// ===== Singleton Instance =====

/**
 * Global map store instance
 * Import and use this in your components
 */
export const workspaceManager = new WorkspaceManager();

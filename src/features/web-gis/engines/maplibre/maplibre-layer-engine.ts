import { LngLatBounds, type Map as MapLibreMap } from "maplibre-gl";

import type { SerializedLayer } from "../../domain";
import type { ILayerEngine } from "../ports";

/**
 * MapLibre implementation of ILayerEngine.
 * Handles diff-based layer synchronization.
 */
export class MapLibreLayerEngine implements ILayerEngine {
  private map: MapLibreMap | null = null;
  private currentLayers: Map<string, SerializedLayer> = new Map();
  private activeTerrainSourceId: string | null = null;

  /**
   * Binds the engine to a MapLibre map instance.
   */
  bind(map: MapLibreMap): void {
    this.map = map;
  }

  sync(layers: SerializedLayer[]): void {
    if (!this.map) {
      return;
    }

    const newLayerIds = new Set(layers.map((layer) => layer.id));
    const currentLayerIds = new Set(this.currentLayers.keys());

    // If the currently active terrain source is about to be removed,
    // detach terrain before source removal.
    if (this.activeTerrainSourceId) {
      const activeTerrainLayerId = this.activeTerrainSourceId.replace(
        "source-",
        ""
      );

      if (!newLayerIds.has(activeTerrainLayerId)) {
        this.map.setTerrain(null);
        this.activeTerrainSourceId = null;
      }
    }

    // Remove layers that no longer exist.
    for (const layerId of currentLayerIds) {
      if (!newLayerIds.has(layerId)) {
        this.removeLayer(layerId);
      }
    }

    // Add or update layers.
    for (const layer of layers) {
      const existing = this.currentLayers.get(layer.id);

      if (!existing) {
        this.addLayer(layer);
      } else if (this.hasLayerChanged(existing, layer)) {
        this.updateLayer(layer);
      }
    }

    // Update layer order.
    this.reorderLayers(layers);
    this.syncTerrain(layers);
  }

  fitToLayer(layerId: string): void {
    const layer = this.currentLayers.get(layerId);

    if (!layer) {
      return;
    }

    if (layer.bbox) {
      this.fitToBounds(layer.bbox);
      return;
    }

    if (layer.type === "vector" && layer.data) {
      const bbox = this.computeGeoJSONBBox(
        layer.data as GeoJSON.FeatureCollection
      );

      if (bbox) {
        this.fitToBounds(bbox);
      }
    }
  }

  private computeGeoJSONBBox(
    collection: GeoJSON.FeatureCollection
  ): [number, number, number, number] | null {
    const bounds = new LngLatBounds();

    const extendWithCoords = (coords: unknown): void => {
      if (!Array.isArray(coords)) return;

      if (typeof coords[0] === "number") {
        bounds.extend([coords[0], coords[1]] as [number, number]);
      } else {
        coords.forEach(extendWithCoords);
      }
    };

    for (const feature of collection.features) {
      if (!feature.geometry) continue;

      if (feature.geometry.type === "GeometryCollection") {
        for (const geom of feature.geometry.geometries) {
          if ("coordinates" in geom) {
            extendWithCoords(geom.coordinates);
          }
        }
      } else {
        extendWithCoords(feature.geometry.coordinates);
      }
    }

    if (bounds.isEmpty()) return null;

    return [
      bounds.getWest(),
      bounds.getSouth(),
      bounds.getEast(),
      bounds.getNorth(),
    ];
  }

  fitToBounds(bbox: [number, number, number, number]): void {
    if (!this.map) return;

    // bbox is [minLng, minLat, maxLng, maxLat].
    this.map.fitBounds(
      [
        [bbox[0], bbox[1]],
        [bbox[2], bbox[3]],
      ],
      { padding: 50 }
    );
  }

  private addLayer(layer: SerializedLayer): void {
    if (!this.map) {
      return;
    }

    const sourceId = `source-${layer.id}`;

    this.addSource(sourceId, layer);
    this.addMapLibreLayers(layer.id, sourceId, layer);

    this.currentLayers.set(layer.id, { ...layer });
  }

  private addSource(sourceId: string, layer: SerializedLayer): void {
    if (!this.map) {
      return;
    }

    switch (layer.type) {
      case "raster":
        if (layer.rasterKind === "elevation") {
          this.map.addSource(sourceId, {
            type: "raster-dem",
            tiles: layer.data as string[],
            tileSize: 256,
            bounds: layer.bbox,
            encoding: "mapbox",
          });
        } else {
          this.map.addSource(sourceId, {
            type: "raster",
            tiles: layer.data as string[],
            tileSize: 256,
            bounds: layer.bbox,
          });
        }
        break;

      case "wms":
        this.map.addSource(sourceId, {
          type: "raster",
          tiles: [layer.data as string],
          tileSize: 256,
          bounds: layer.bbox,
        });
        break;

      case "vector":
        this.map.addSource(sourceId, {
          type: "geojson",
          data: layer.data as string,
        });
        break;

      default:
        console.warn(`Unsupported layer type: ${layer.type}`);
        break;
    }
  }

  private addMapLibreLayers(
    layerId: string,
    sourceId: string,
    layer: SerializedLayer
  ): void {
    if (!this.map) return;

    const visibility = layer.visible ? "visible" : "none";

    if (layer.type === "raster" && layer.rasterKind === "elevation") {
      // Terrain-only mode: no overlay layer.
      return;
    }

    if (layer.type === "raster" || layer.type === "wms") {
      this.map.addLayer({
        id: `${layerId}-raster`,
        type: "raster",
        source: sourceId,
        layout: { visibility },
      });
      return;
    }

    if (layer.type === "vector") {
      // Add polygon fill
      this.map.addLayer({
        id: `${layerId}-fill`,
        type: "fill",
        source: sourceId,
        filter: [
          "in",
          ["geometry-type"],
          ["literal", ["Polygon", "MultiPolygon"]],
        ],
        layout: { visibility },
        paint: {
          "fill-color": layer.style?.fillColor || "#3182ce",
          "fill-opacity": layer.style?.fillOpacity ?? 0.4,
        },
      });

      // Add line borders and LineStrings
      this.map.addLayer({
        id: `${layerId}-line`,
        type: "line",
        source: sourceId,
        filter: [
          "match",
          ["geometry-type"],
          ["Polygon", "MultiPolygon", "LineString", "MultiLineString"],
          true,
          false,
        ],
        layout: { visibility },
        paint: {
          "line-color": layer.style?.strokeColor || "#2b6cb0",
          "line-width": layer.style?.strokeWidth ?? 2,
        },
      });

      // Add point markers
      this.map.addLayer({
        id: `${layerId}-circle`,
        type: "circle",
        source: sourceId,
        filter: ["==", ["geometry-type"], "Point"],
        layout: { visibility },
        paint: {
          "circle-color": layer.style?.pointColor || "#e53e3e",
          "circle-radius": layer.style?.pointRadius ?? 5,
        },
      });
      return;
    }
  }

  private updateLayer(layer: SerializedLayer): void {
    this.removeLayer(layer.id);
    this.addLayer(layer);
  }

  private removeLayer(layerId: string): void {
    if (!this.map) {
      return;
    }

    const layer = this.currentLayers.get(layerId);

    if (!layer) {
      return;
    }

    const layerTypes = this.getLayerTypes(layer);

    for (const type of layerTypes) {
      const mapLayerId = `${layerId}-${type}`;

      if (this.map.getLayer(mapLayerId)) {
        this.map.removeLayer(mapLayerId);
      }
    }

    const sourceId = `source-${layerId}`;
    // A DEM source cannot be removed while it is bound as terrain source.
    if (
      this.activeTerrainSourceId === sourceId ||
      this.map.getTerrain()?.source === sourceId
    ) {
      this.map.setTerrain(null);
      this.activeTerrainSourceId = null;
    }

    if (this.map.getSource(sourceId)) {
      this.map.removeSource(sourceId);
    }

    this.currentLayers.delete(layerId);
  }

  private reorderLayers(layers: SerializedLayer[]): void {
    if (!this.map) return;

    const sorted = [...layers].sort((a, b) => a.order - b.order);

    for (let i = 1; i < sorted.length; i++) {
      const currentLayer = sorted[i];
      const previousLayer = sorted[i - 1];

      const currentTypes = this.getLayerTypes(currentLayer);
      const previousTypes = this.getLayerTypes(previousLayer);

      if (currentTypes.length > 0 && previousTypes.length > 0) {
        const currentFirstLayerId = `${currentLayer.id}-${currentTypes[0]}`;
        const previousLastLayerId = `${previousLayer.id}-${previousTypes[previousTypes.length - 1]}`;

        if (
          this.map.getLayer(currentFirstLayerId) &&
          this.map.getLayer(previousLastLayerId)
        ) {
          this.map.moveLayer(currentFirstLayerId, previousLastLayerId);
        }
      }
    }
  }

  private getLayerTypes(layer: SerializedLayer): string[] {
    if (layer.type === "raster") {
      return layer.rasterKind === "elevation" ? [] : ["raster"];
    }
    if (layer.type === "wms") {
      return ["raster"];
    }
    if (layer.type === "vector") {
      return ["fill", "line", "circle"];
    }
    return [];
  }

  private syncTerrain(layers: SerializedLayer[]): void {
    if (!this.map) return;

    const terrainLayer = [...layers]
      .sort((a, b) => b.order - a.order)
      .find(
        (layer) =>
          layer.type === "raster" &&
          layer.rasterKind === "elevation" &&
          layer.visible &&
          layer.terrainEnabled
      );

    if (!terrainLayer) {
      this.map.setTerrain(null);
      this.activeTerrainSourceId = null;
      return;
    }

    const sourceId = `source-${terrainLayer.id}`;
    if (!this.map.getSource(sourceId)) {
      this.map.setTerrain(null);
      this.activeTerrainSourceId = null;
      return;
    }

    this.map.setTerrain({
      source: sourceId,
    });

    this.activeTerrainSourceId = sourceId;
  }

  private hasLayerChanged(
    existing: SerializedLayer,
    newLayer: SerializedLayer
  ): boolean {
    return (
      existing.visible !== newLayer.visible ||
      existing.order !== newLayer.order ||
      existing.rasterKind !== newLayer.rasterKind ||
      existing.terrainEnabled !== newLayer.terrainEnabled ||
      JSON.stringify(existing.style) !== JSON.stringify(newLayer.style) ||
      JSON.stringify(existing.data) !== JSON.stringify(newLayer.data)
    );
  }

  /**
   * Cleans up the engine.
   */
  destroy(): void {
    for (const layerId of this.currentLayers.keys()) {
      this.removeLayer(layerId);
    }
    this.currentLayers.clear();
    this.activeTerrainSourceId = null;
    this.map = null;
  }
}

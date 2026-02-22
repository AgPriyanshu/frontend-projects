import type { Map as MapLibreMap } from "maplibre-gl";

import type { SerializedLayer } from "../../domain";
import type { ILayerEngine } from "../ports";

/**
 * MapLibre implementation of ILayerEngine.
 * Handles diff-based layer synchronization.
 */
export class MapLibreLayerEngine implements ILayerEngine {
  private map: MapLibreMap | null = null;
  private currentLayers: Map<string, SerializedLayer> = new Map();
  private layerGeoJSON: Map<string, GeoJSON.GeoJSON> = new Map();
  private activeTerrainSourceId: string | null = null;

  /**
   * Binds the engine to a MapLibre map instance.
   */
  bind(map: MapLibreMap): void {
    this.map = map;
  }

  sync(layers: SerializedLayer[]): void {
    if (!this.map) return;

    const newLayerIds = new Set(layers.map((l) => l.id));
    const currentLayerIds = new Set(this.currentLayers.keys());

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
    if (!this.map) return;

    // Use stored GeoJSON data for bounds calculation.
    const geoJSON = this.layerGeoJSON.get(layerId);
    if (geoJSON) {
      const bounds = this.calculateBounds(geoJSON);
      if (bounds) {
        this.map.fitBounds(bounds, { padding: 50 });
      }
    }
  }

  fitToBounds(bbox: [number, number, number, number]): void {
    if (!this.map) return;

    // bbox is [minLng, minLat, maxLng, maxLat].
    this.map.fitBounds(
      [
        [bbox[0], bbox[1]], // [minLng, minLat]
        [bbox[2], bbox[3]], // [maxLng, maxLat]
      ],
      { padding: 50 }
    );
  }

  private addLayer(layer: SerializedLayer): void {
    if (!this.map) return;

    const sourceId = `source-${layer.id}`;

    // Add source based on layer type.
    this.addSource(sourceId, layer);

    // Add MapLibre layers based on layer type.
    this.addMapLibreLayers(layer.id, sourceId, layer);

    // Store GeoJSON data for fitToLayer.
    if ((layer.type === "geojson" || layer.type === "vector") && layer.data) {
      this.layerGeoJSON.set(layer.id, layer.data as GeoJSON.GeoJSON);
    }

    this.currentLayers.set(layer.id, { ...layer });
  }

  private addSource(sourceId: string, layer: SerializedLayer): void {
    if (!this.map) return;

    switch (layer.type) {
      case "geojson":
      case "vector":
        this.map.addSource(sourceId, {
          type: "geojson",
          data: layer.data as GeoJSON.GeoJSON,
        });
        break;

      case "raster":
        if (layer.rasterKind === "elevation") {
          this.map.addSource(sourceId, {
            type: "raster-dem",
            tiles: layer.data as string[],
            tileSize: 256,
            bounds: layer.bbox,
            encoding: "mapbox", // Terrain-RGB
            // maxzoom: 14, // MapLibre Terrain requires a maxzoom to extrapolate from
          });
        } else {
          this.map.addSource(sourceId, {
            type: "raster",
            tiles: layer.data as string[],
            tileSize: 256,
            bounds: layer.bbox, // Limit requests to bbox
          });
        }
        break;

      case "wms":
        // WMS layers use raster source with WMS URL template.
        this.map.addSource(sourceId, {
          type: "raster",
          tiles: [layer.data as string],
          tileSize: 256,
          bounds: layer.bbox, // Limit requests to bbox
        });
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
      // Terrain-only mode: no hillshade overlay layer.
      // The DEM source is consumed by map.setTerrain(...) in syncTerrain().
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

    // For vector/geojson layers, add fill, line, and point layers.
    this.map.addLayer({
      id: `${layerId}-fill`,
      type: "fill",
      source: sourceId,
      paint: {
        "fill-color": layer.style.fillColor ?? "#088",
        "fill-opacity": layer.style.fillOpacity ?? 0.4,
      },
      filter: ["==", "$type", "Polygon"],
      layout: { visibility },
    });

    this.map.addLayer({
      id: `${layerId}-line`,
      type: "line",
      source: sourceId,
      paint: {
        "line-color": layer.style.strokeColor ?? "#088",
        "line-width": layer.style.strokeWidth ?? 2,
      },
      filter: ["in", "$type", "LineString", "Polygon"],
      layout: { visibility },
    });

    this.map.addLayer({
      id: `${layerId}-circle`,
      type: "circle",
      source: sourceId,
      paint: {
        "circle-radius": layer.style.pointRadius ?? 6,
        "circle-color": layer.style.pointColor ?? "#088",
        "circle-stroke-width": 2,
        "circle-stroke-color": "#fff",
      },
      filter: ["==", "$type", "Point"],
      layout: { visibility },
    });
  }

  private updateLayer(layer: SerializedLayer): void {
    if (!this.map) return;

    const sourceId = `source-${layer.id}`;
    const source = this.map.getSource(sourceId);

    // Update source data if it's a GeoJSON source.
    if (source && source.type === "geojson") {
      (source as maplibregl.GeoJSONSource).setData(
        layer.data as GeoJSON.GeoJSON
      );
    }

    // Update visibility.
    const visibility = layer.visible ? "visible" : "none";
    const layerTypes = this.getLayerTypes(layer);

    for (const type of layerTypes) {
      const mapLayerId = `${layer.id}-${type}`;
      if (this.map.getLayer(mapLayerId)) {
        this.map.setLayoutProperty(mapLayerId, "visibility", visibility);
      }
    }

    // Update styles.
    this.updateLayerStyles(layer);

    this.currentLayers.set(layer.id, { ...layer });
  }

  private updateLayerStyles(layer: SerializedLayer): void {
    if (!this.map) return;

    if (layer.type === "raster" || layer.type === "wms") return;

    const fillLayerId = `${layer.id}-fill`;
    if (this.map.getLayer(fillLayerId)) {
      if (layer.style.fillColor) {
        this.map.setPaintProperty(
          fillLayerId,
          "fill-color",
          layer.style.fillColor
        );
      }
      if (layer.style.fillOpacity !== undefined) {
        this.map.setPaintProperty(
          fillLayerId,
          "fill-opacity",
          layer.style.fillOpacity
        );
      }
    }

    const lineLayerId = `${layer.id}-line`;
    if (this.map.getLayer(lineLayerId)) {
      if (layer.style.strokeColor) {
        this.map.setPaintProperty(
          lineLayerId,
          "line-color",
          layer.style.strokeColor
        );
      }
      if (layer.style.strokeWidth !== undefined) {
        this.map.setPaintProperty(
          lineLayerId,
          "line-width",
          layer.style.strokeWidth
        );
      }
    }

    const circleLayerId = `${layer.id}-circle`;
    if (this.map.getLayer(circleLayerId)) {
      if (layer.style.pointColor) {
        this.map.setPaintProperty(
          circleLayerId,
          "circle-color",
          layer.style.pointColor
        );
      }
      if (layer.style.pointRadius !== undefined) {
        this.map.setPaintProperty(
          circleLayerId,
          "circle-radius",
          layer.style.pointRadius
        );
      }
    }
  }

  private removeLayer(layerId: string): void {
    if (!this.map) return;

    const layer = this.currentLayers.get(layerId);
    if (!layer) return;

    const layerTypes = this.getLayerTypes(layer);

    for (const type of layerTypes) {
      const mapLayerId = `${layerId}-${type}`;
      if (this.map.getLayer(mapLayerId)) {
        this.map.removeLayer(mapLayerId);
      }
    }

    const sourceId = `source-${layerId}`;
    if (this.map.getSource(sourceId)) {
      this.map.removeSource(sourceId);
    }

    this.currentLayers.delete(layerId);
    this.layerGeoJSON.delete(layerId);
  }

  private reorderLayers(layers: SerializedLayer[]): void {
    if (!this.map) return;

    // Sort by order and apply.
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
          // Move current layer after previous layer.
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
    return ["fill", "line", "circle"];
  }

  private syncTerrain(layers: SerializedLayer[]): void {
    if (!this.map) return;

    // MapLibre supports a single terrain source at a time.
    // Choose the top-most visible elevation layer with terrain enabled.
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

  private calculateBounds(
    data: GeoJSON.GeoJSON
  ): [[number, number], [number, number]] | null {
    const coords: [number, number][] = [];

    const extractCoords = (geometry: GeoJSON.Geometry) => {
      if (geometry.type === "Point") {
        coords.push(geometry.coordinates as [number, number]);
      } else if (
        geometry.type === "LineString" ||
        geometry.type === "MultiPoint"
      ) {
        (geometry.coordinates as [number, number][]).forEach((c) =>
          coords.push(c)
        );
      } else if (
        geometry.type === "Polygon" ||
        geometry.type === "MultiLineString"
      ) {
        (geometry.coordinates as [number, number][][]).forEach((ring) =>
          ring.forEach((c) => coords.push(c))
        );
      } else if (geometry.type === "MultiPolygon") {
        (geometry.coordinates as [number, number][][][]).forEach((polygon) =>
          polygon.forEach((ring) => ring.forEach((c) => coords.push(c)))
        );
      } else if (geometry.type === "GeometryCollection") {
        geometry.geometries.forEach(extractCoords);
      }
    };

    if (data.type === "Feature") {
      extractCoords(data.geometry);
    } else if (data.type === "FeatureCollection") {
      data.features.forEach((f) => extractCoords(f.geometry));
    } else {
      extractCoords(data as GeoJSON.Geometry);
    }

    if (coords.length === 0) return null;

    // Create bounds manually using the first coordinate.
    let minLng = coords[0][0];
    let maxLng = coords[0][0];
    let minLat = coords[0][1];
    let maxLat = coords[0][1];

    for (const coord of coords) {
      minLng = Math.min(minLng, coord[0]);
      maxLng = Math.max(maxLng, coord[0]);
      minLat = Math.min(minLat, coord[1]);
      maxLat = Math.max(maxLat, coord[1]);
    }

    return [
      [minLng, minLat],
      [maxLng, maxLat],
    ] as [[number, number], [number, number]];
  }

  /**
   * Cleans up the engine.
   */
  destroy(): void {
    // Remove all layers.
    for (const layerId of this.currentLayers.keys()) {
      this.removeLayer(layerId);
    }
    this.currentLayers.clear();
    this.activeTerrainSourceId = null;
    this.map = null;
  }
}

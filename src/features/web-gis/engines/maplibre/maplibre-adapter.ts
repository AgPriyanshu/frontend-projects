import {
  FullscreenControl,
  GlobeControl,
  Map as MapLibreMap,
  NavigationControl,
  ScaleControl,
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import { DEFAULT_MAP_VIEW, type MapView } from "../../domain";
import type { IMapAdapter } from "../ports";
import { MapLibreMapEngine } from "./maplibre-map-engine";
import { MapLibreLayerEngine } from "./maplibre-layer-engine";
import { MapLibreDrawEngine } from "./maplibre-draw-engine";

/**
 * MapLibre adapter implementing IMapAdapter.
 * Orchestrates all MapLibre engine implementations.
 */
export class MapLibreAdapter implements IMapAdapter {
  private mapInstance: MapLibreMap | null = null;
  private ready = false;

  readonly map: MapLibreMapEngine;
  readonly layers: MapLibreLayerEngine;
  readonly draw: MapLibreDrawEngine;

  private initialView: MapView;

  constructor(initialView: MapView = DEFAULT_MAP_VIEW) {
    this.map = new MapLibreMapEngine();
    this.layers = new MapLibreLayerEngine();
    this.draw = new MapLibreDrawEngine();
    this.initialView = initialView;
  }

  mount(container: HTMLElement): void {
    if (this.mapInstance) {
      console.warn("MapLibreAdapter: Map already mounted");
      return;
    }

    this.mapInstance = new MapLibreMap({
      container,
      style: "https://demotiles.maplibre.org/globe.json",
      center: this.initialView.center,
      zoom: this.initialView.zoom,
      bearing: this.initialView.bearing,
      pitch: this.initialView.pitch,
      // Increase tile cache size for better performance during zoom.
      maxTileCacheSize: 200,
    });

    // Add controls.
    this.mapInstance.addControl(
      new FullscreenControl({
        container,
      })
    );
    this.mapInstance.addControl(new GlobeControl());
    this.mapInstance.addControl(new NavigationControl(), "top-left");
    this.mapInstance.addControl(
      new ScaleControl({
        maxWidth: 80,
        unit: "metric",
      })
    );

    // Bind engines when map is ready.
    this.mapInstance.on("load", () => {
      if (!this.mapInstance) return;

      // Add satellite base layer.
      this.mapInstance.addSource("satellite", {
        type: "raster",
        tiles: ["https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"],
        tileSize: 256,
      });

      this.mapInstance.addLayer({
        id: "satellite-layer",
        type: "raster",
        source: "satellite",
      });

      // Hide default style layers.
      this.mapInstance.getStyle().layers.forEach((layer) => {
        if (layer.id !== "satellite-layer") {
          this.mapInstance?.setLayoutProperty(layer.id, "visibility", "none");
        }
      });

      // Bind all engines.
      this.map.bind(this.mapInstance);
      this.layers.bind(this.mapInstance);
      this.draw.bind(this.mapInstance);

      this.ready = true;
    });
  }

  isReady(): boolean {
    return this.ready;
  }

  /**
   * Gets the underlying MapLibre instance for advanced use cases.
   * @internal
   */
  getMapInstance(): MapLibreMap | null {
    return this.mapInstance;
  }

  destroy(): void {
    this.ready = false;

    this.map.destroy();
    this.layers.destroy();
    this.draw.destroy();

    if (this.mapInstance) {
      this.mapInstance.remove();
      this.mapInstance = null;
    }
  }
}

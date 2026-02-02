import type { Map as MapLibreMap } from "maplibre-gl";

import type { MapView, Unsubscribe } from "../../domain";
import type { IMapEngine } from "../ports";

/**
 * MapLibre implementation of IMapEngine.
 * Handles view state management using MapLibre GL JS.
 */
export class MapLibreMapEngine implements IMapEngine {
  private map: MapLibreMap | null = null;
  private viewChangeCallbacks: Set<(view: MapView) => void> = new Set();

  /**
   * Binds the engine to a MapLibre map instance.
   */
  bind(map: MapLibreMap): void {
    this.map = map;
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    if (!this.map) return;

    const handleViewChange = () => {
      const view = this.getView();
      this.viewChangeCallbacks.forEach((cb) => cb(view));
    };

    this.map.on("moveend", handleViewChange);
    this.map.on("zoomend", handleViewChange);
    this.map.on("pitchend", handleViewChange);
    this.map.on("rotateend", handleViewChange);
  }

  getView(): MapView {
    if (!this.map) {
      return { center: [0, 0], zoom: 0, bearing: 0, pitch: 0 };
    }

    const center = this.map.getCenter();
    return {
      center: [center.lng, center.lat],
      zoom: this.map.getZoom(),
      bearing: this.map.getBearing(),
      pitch: this.map.getPitch(),
    };
  }

  setView(view: Partial<MapView>): void {
    if (!this.map) return;

    this.map.jumpTo({
      center: view.center,
      zoom: view.zoom,
      bearing: view.bearing,
      pitch: view.pitch,
    });
  }

  onViewChange(callback: (view: MapView) => void): Unsubscribe {
    this.viewChangeCallbacks.add(callback);
    return () => {
      this.viewChangeCallbacks.delete(callback);
    };
  }

  fitBounds(
    bounds: [[number, number], [number, number]],
    options?: { padding?: number }
  ): void {
    if (!this.map) return;
    this.map.fitBounds(bounds, { padding: options?.padding ?? 50 });
  }

  /**
   * Cleans up the engine.
   */
  destroy(): void {
    this.viewChangeCallbacks.clear();
    this.map = null;
  }
}

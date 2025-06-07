import maplibregl from "maplibre-gl";
import { MaplibreTerradrawControl } from "@watergis/maplibre-gl-terradraw";

export type MapOptions = {
  center?: [number, number];
  zoom?: number;
  style?: string;
};

export type MarkerOptions = {
  id: string;
  lngLat: [number, number];
  popup?: {
    content: string;
    options?: maplibregl.PopupOptions;
  };
  options?: maplibregl.MarkerOptions;
};

export class MapManager {
  private static instance: MapManager;
  private map: maplibregl.Map | null = null;
  private draw: MaplibreTerradrawControl | null = null;
  private markers: Map<string, maplibregl.Marker> = new Map();
  private popups: Map<string, maplibregl.Popup> = new Map();
  private eventListeners: Map<string, Set<Function>> = new Map();

  private constructor() {}

  public static getInstance(): MapManager {
    if (!MapManager.instance) {
      MapManager.instance = new MapManager();
    }
    return MapManager.instance;
  }

  public initializeMap(
    container: HTMLElement,
    options: MapOptions = {}
  ): maplibregl.Map {
    const {
      center = [78.9629, 20.5937],
      zoom = 4,
      style = "https://demotiles.maplibre.org/style.json",
    } = options;

    // Initialize map
    this.map = new maplibregl.Map({
      container,
      style,
      center,
      zoom,
    });

    // Add navigation controls
    this.map.addControl(new maplibregl.NavigationControl(), "top-right");

    // Initialize drawing controls
    this.initializeDrawingControls();

    // Initialize event listeners
    this.initializeEventListeners();

    return this.map;
  }

  private initializeDrawingControls(): void {
    if (!this.map) return;

    this.draw = new MaplibreTerradrawControl({
      modes: [
        "point",
        "linestring",
        "polygon",
        "rectangle",
        "circle",
        "freehand",
        "select",
        "delete-selection",
        "delete",
      ],
      open: true,
    });

    this.map.addControl(this.draw, "top-left");
  }

  private initializeEventListeners(): void {
    if (!this.map) return;

    // Initialize common event listeners
    const events = [
      "click",
      "dblclick",
      "mousemove",
      "mouseenter",
      "mouseleave",
      "mousedown",
      "mouseup",
      "touchstart",
      "touchend",
      "touchcancel",
      "load",
      "error",
      "style.load",
      "data.load",
      "move",
      "moveend",
      "zoom",
      "zoomend",
      "rotate",
      "rotateend",
      "pitch",
      "pitchend",
      "drag",
      "dragend",
    ];

    events.forEach((event) => {
      this.map?.on(event, (e) => {
        const listeners = this.eventListeners.get(event);
        if (listeners) {
          listeners.forEach((listener) => listener(e));
        }
      });
    });
  }

  public on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)?.add(callback);
  }

  public off(event: string, callback: Function): void {
    this.eventListeners.get(event)?.delete(callback);
  }

  public addMarker(options: MarkerOptions): void {
    if (!this.map) return;

    const marker = new maplibregl.Marker(options.options).setLngLat(
      options.lngLat
    );

    if (options.popup) {
      const popup = new maplibregl.Popup(options.popup.options).setHTML(
        options.popup.content
      );
      marker.setPopup(popup);
      this.popups.set(options.id, popup);
    }

    marker.addTo(this.map);
    this.markers.set(options.id, marker);
  }

  public removeMarker(id: string): void {
    const marker = this.markers.get(id);
    if (marker) {
      marker.remove();
      this.markers.delete(id);
    }
  }

  public addPopup(
    id: string,
    lngLat: [number, number],
    content: string,
    options?: maplibregl.PopupOptions
  ): void {
    if (!this.map) return;

    const popup = new maplibregl.Popup(options)
      .setLngLat(lngLat)
      .setHTML(content)
      .addTo(this.map);

    this.popups.set(id, popup);
  }

  public removePopup(id: string): void {
    const popup = this.popups.get(id);
    if (popup) {
      popup.remove();
      this.popups.delete(id);
    }
  }

  public getMap(): maplibregl.Map | null {
    return this.map;
  }

  public getDrawControl(): MaplibreTerradrawControl | null {
    return this.draw;
  }

  public setCenter(center: [number, number]): void {
    this.map?.setCenter(center);
  }

  public setZoom(zoom: number): void {
    this.map?.setZoom(zoom);
  }

  public setStyle(style: string): void {
    this.map?.setStyle(style);
  }

  public flyTo(options: maplibregl.FlyToOptions): void {
    this.map?.flyTo(options);
  }

  public fitBounds(
    bounds: maplibregl.LngLatBoundsLike,
    options?: maplibregl.FitBoundsOptions
  ): void {
    this.map?.fitBounds(bounds, options);
  }

  public addLayer(
    layer: maplibregl.LayerSpecification,
    beforeId?: string
  ): void {
    this.map?.addLayer(layer, beforeId);
  }

  public removeLayer(id: string): void {
    this.map?.removeLayer(id);
  }

  public addSource(id: string, source: maplibregl.SourceSpecification): void {
    this.map?.addSource(id, source);
  }

  public removeSource(id: string): void {
    this.map?.removeSource(id);
  }

  public getBounds(): maplibregl.LngLatBounds | null {
    return this.map?.getBounds() || null;
  }

  public getCenter(): [number, number] | null {
    return (this.map?.getCenter().toArray() as [number, number]) || null;
  }

  public getZoom(): number | null {
    return this.map?.getZoom() || null;
  }

  public getPitch(): number | null {
    return this.map?.getPitch() || null;
  }

  public getBearing(): number | null {
    return this.map?.getBearing() || null;
  }

  public project(lngLat: [number, number]): maplibregl.Point | null {
    return this.map?.project(lngLat) || null;
  }

  public unproject(point: maplibregl.Point): maplibregl.LngLat | null {
    return this.map?.unproject(point) || null;
  }

  public cleanup(): void {
    // Remove all markers
    this.markers.forEach((marker) => marker.remove());
    this.markers.clear();

    // Remove all popups
    this.popups.forEach((popup) => popup.remove());
    this.popups.clear();

    // Remove all event listeners
    this.eventListeners.clear();

    // Remove map
    this.map?.remove();
    this.map = null;
    this.draw = null;
  }
}

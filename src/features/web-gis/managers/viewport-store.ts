/**
 * ViewportStore - Manages map viewport/camera state
 *
 * Responsibilities:
 * - Track camera position (center, zoom, bearing, pitch)
 * - Manage viewport constraints
 * - Provide viewport manipulation methods
 * - NO knowledge of map instance (pure state)
 */

import { makeAutoObservable } from "mobx";
import type { ViewportState, ViewportConstraints } from "./types";

export class ViewportManager {
  // Camera position
  center: [number, number] = [78.9629, 20.5937]; // Default: India
  zoom: number = 4;
  bearing: number = 0; // Rotation (0-360)
  pitch: number = 0; // Tilt (0-60)

  // Viewport bounds
  bounds: [[number, number], [number, number]] | null = null;

  // Constraints
  constraints: ViewportConstraints = {
    minZoom: 0,
    maxZoom: 22,
    maxBounds: undefined,
  };

  // Projection (for future use)
  projection: string = "mercator";

  constructor(initialState?: Partial<ViewportState>) {
    makeAutoObservable(this);

    if (initialState) {
      this.setViewport(initialState);
    }
  }

  // ===== Viewport Updates =====

  /**
   * Set viewport state (partial update)
   */
  setViewport(viewport: Partial<ViewportState>) {
    if (viewport.center !== undefined) {
      this.setCenter(viewport.center);
    }
    if (viewport.zoom !== undefined) {
      this.setZoom(viewport.zoom);
    }
    if (viewport.bearing !== undefined) {
      this.setBearing(viewport.bearing);
    }
    if (viewport.pitch !== undefined) {
      this.setPitch(viewport.pitch);
    }
    if (viewport.bounds !== undefined) {
      this.bounds = viewport.bounds;
    }
    if (viewport.projection !== undefined) {
      this.projection = viewport.projection;
    }
  }

  /**
   * Set map center
   */
  setCenter(center: [number, number]) {
    // Normalize longitude to -180 to 180
    let [lng, lat] = center;
    while (lng > 180) lng -= 360;
    while (lng < -180) lng += 360;

    // Clamp latitude to -90 to 90
    lat = Math.max(-90, Math.min(90, lat));

    this.center = [lng, lat];
  }

  /**
   * Set zoom level
   */
  setZoom(zoom: number) {
    const min = this.constraints.minZoom ?? 0;
    const max = this.constraints.maxZoom ?? 22;
    this.zoom = Math.max(min, Math.min(max, zoom));
  }

  /**
   * Set bearing (rotation)
   */
  setBearing(bearing: number) {
    // Normalize to 0-360
    this.bearing = ((bearing % 360) + 360) % 360;
  }

  /**
   * Set pitch (tilt)
   */
  setPitch(pitch: number) {
    // Clamp to 0-60 (MapLibre max)
    this.pitch = Math.max(0, Math.min(60, pitch));
  }

  /**
   * Set viewport bounds
   */
  setBounds(bounds: [[number, number], [number, number]]) {
    this.bounds = bounds;
  }

  // ===== Constraints =====

  /**
   * Set zoom constraints
   */
  setZoomConstraints(minZoom?: number, maxZoom?: number) {
    if (minZoom !== undefined) {
      this.constraints.minZoom = minZoom;
    }
    if (maxZoom !== undefined) {
      this.constraints.maxZoom = maxZoom;
    }

    // Re-apply constraints to current zoom
    if (this.zoom !== undefined) {
      this.setZoom(this.zoom);
    }
  }

  /**
   * Set max bounds (restrict panning area)
   */
  setMaxBounds(bounds: [[number, number], [number, number]] | undefined) {
    this.constraints.maxBounds = bounds;
  }

  // ===== Viewport Manipulation =====

  /**
   * Pan by a delta (in pixels, handled by map instance)
   */
  panBy(_dx: number, _dy: number) {
    // This will be handled by the map instance
    // Store just tracks the result via setCenter
  }

  /**
   * Zoom in by one level
   */
  zoomIn() {
    this.setZoom(this.zoom + 1);
  }

  /**
   * Zoom out by one level
   */
  zoomOut() {
    this.setZoom(this.zoom - 1);
  }

  /**
   * Reset bearing to north
   */
  resetBearing() {
    this.setBearing(0);
  }

  /**
   * Reset pitch to flat
   */
  resetPitch() {
    this.setPitch(0);
  }

  /**
   * Reset to initial viewport
   */
  reset(defaultState?: Partial<ViewportState>) {
    const defaults = defaultState || {
      center: [78.9629, 20.5937],
      zoom: 4,
      bearing: 0,
      pitch: 0,
    };

    this.setViewport(defaults);
    this.bounds = null;
  }

  // ===== Getters =====

  /**
   * Get complete viewport state as plain object
   */
  getState(): ViewportState {
    return {
      center: this.center,
      zoom: this.zoom,
      bearing: this.bearing,
      pitch: this.pitch,
      bounds: this.bounds || undefined,
      projection: this.projection,
    };
  }

  /**
   * Get viewport as URL parameters (for sharing)
   */
  toURLParams(): string {
    const [lng, lat] = this.center;
    const params = new URLSearchParams({
      center: `${lng.toFixed(4)},${lat.toFixed(4)}`,
      zoom: this.zoom.toFixed(2),
    });

    if (this.bearing !== 0) {
      params.set("bearing", this.bearing.toFixed(2));
    }
    if (this.pitch !== 0) {
      params.set("pitch", this.pitch.toFixed(2));
    }

    return params.toString();
  }

  /**
   * Load viewport from URL parameters
   */
  fromURLParams(params: URLSearchParams) {
    const center = params.get("center");
    const zoom = params.get("zoom");
    const bearing = params.get("bearing");
    const pitch = params.get("pitch");

    if (center) {
      const [lng, lat] = center.split(",").map(Number);
      if (!isNaN(lng) && !isNaN(lat)) {
        this.setCenter([lng, lat]);
      }
    }

    if (zoom) {
      const z = Number(zoom);
      if (!isNaN(z)) {
        this.setZoom(z);
      }
    }

    if (bearing) {
      const b = Number(bearing);
      if (!isNaN(b)) {
        this.setBearing(b);
      }
    }

    if (pitch) {
      const p = Number(pitch);
      if (!isNaN(p)) {
        this.setPitch(p);
      }
    }
  }

  // ===== Computed Values =====

  /**
   * Check if viewport is at minimum zoom
   */
  get isAtMinZoom(): boolean {
    return this.zoom <= (this.constraints.minZoom ?? 0);
  }

  /**
   * Check if viewport is at maximum zoom
   */
  get isAtMaxZoom(): boolean {
    return this.zoom >= (this.constraints.maxZoom ?? 22);
  }

  /**
   * Check if map is tilted
   */
  get isTilted(): boolean {
    return this.pitch > 0;
  }

  /**
   * Check if map is rotated
   */
  get isRotated(): boolean {
    return this.bearing !== 0;
  }
}

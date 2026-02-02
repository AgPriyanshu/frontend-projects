import type { DrawMode, Unsubscribe } from "../../domain";

/**
 * Draw engine capability interface.
 * Handles drawing tools and geometry capture.
 */
export interface IDrawEngine {
  /**
   * Sets the current draw mode.
   * Pass null to deactivate drawing.
   */
  setMode(mode: DrawMode | null): void;

  /**
   * Gets the current draw mode.
   */
  getMode(): DrawMode | null;

  /**
   * Subscribes to geometry change events.
   */
  onChange(
    callback: (geometry: GeoJSON.FeatureCollection) => void
  ): Unsubscribe;

  /**
   * Clears all drawn features.
   */
  clear(): void;

  /**
   * Gets all drawn features.
   */
  getFeatures(): GeoJSON.FeatureCollection;
}

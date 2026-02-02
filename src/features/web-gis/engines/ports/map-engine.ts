import type { MapView, Unsubscribe } from "../../domain";

/**
 * Map engine capability interface.
 * Handles view state management and navigation.
 */
export interface IMapEngine {
  /**
   * Gets the current map view state.
   */
  getView(): MapView;

  /**
   * Sets the map view state.
   */
  setView(view: Partial<MapView>): void;

  /**
   * Subscribes to view change events.
   */
  onViewChange(callback: (view: MapView) => void): Unsubscribe;

  /**
   * Fits the map to given bounds.
   */
  fitBounds(
    bounds: [[number, number], [number, number]],
    options?: { padding?: number }
  ): void;
}

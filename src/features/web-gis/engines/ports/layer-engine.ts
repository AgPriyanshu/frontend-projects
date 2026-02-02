import type { SerializedLayer } from "../../domain";

/**
 * Layer engine capability interface.
 * Handles layer management and synchronization.
 */
export interface ILayerEngine {
  /**
   * Syncs layers with the map engine using diff-based updates.
   * Adds new layers, updates existing ones, removes deleted ones.
   */
  sync(layers: SerializedLayer[]): void;

  /**
   * Fits the map view to a specific layer's bounds.
   */
  fitToLayer(layerId: string): void;
}

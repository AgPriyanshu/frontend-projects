import type { IDrawEngine } from "./draw-engine";
import type { ILayerEngine } from "./layer-engine";
import type { IMapEngine } from "./map-engine";

/**
 * Main map manager interface.
 * Aggregates all engine capabilities and manages lifecycle.
 */
export interface IMapManager {
  /**
   * Map engine for view control.
   */
  readonly map: IMapEngine;

  /**
   * Layer engine for layer management.
   */
  readonly layers: ILayerEngine;

  /**
   * Draw engine for drawing tools.
   */
  readonly draw: IDrawEngine;

  /**
   * Mounts the map to a container element.
   */
  mount(container: HTMLElement): void;

  /**
   * Returns true if the map is ready for operations.
   */
  isReady(): boolean;

  /**
   * Destroys the map and cleans up resources.
   */
  destroy(): void;
}

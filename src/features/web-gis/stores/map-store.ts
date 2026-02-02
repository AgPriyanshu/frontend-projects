import { makeAutoObservable, reaction } from "mobx";

import { DEFAULT_MAP_VIEW, type MapView, type Unsubscribe } from "../domain";
import type { IMapEngine } from "../engines/ports";

/**
 * MobX store for map view state.
 * Syncs with IMapEngine bidirectionally.
 */
export class MapStore {
  view: MapView = { ...DEFAULT_MAP_VIEW };

  private engine: IMapEngine | null = null;
  private unsubscribeEngine: Unsubscribe | null = null;
  private disposeReaction: (() => void) | null = null;
  private isUpdatingFromEngine = false;

  constructor() {
    makeAutoObservable(this);
  }

  /**
   * Binds the store to an engine and sets up bidirectional sync.
   */
  bind(engine: IMapEngine): void {
    this.engine = engine;

    // Initialize view from engine.
    this.view = engine.getView();

    // Engine → MobX: Update MobX when engine view changes.
    this.unsubscribeEngine = engine.onViewChange((newView) => {
      this.isUpdatingFromEngine = true;
      this.view = newView;
      this.isUpdatingFromEngine = false;
    });

    // MobX → Engine: Update engine when MobX view changes.
    this.disposeReaction = reaction(
      () => ({ ...this.view }),
      (newView) => {
        if (!this.isUpdatingFromEngine && this.engine) {
          this.engine.setView(newView);
        }
      }
    );
  }

  /**
   * Sets the map view.
   */
  setView(view: Partial<MapView>): void {
    this.view = { ...this.view, ...view };
  }

  /**
   * Sets the map center.
   */
  setCenter(center: [number, number]): void {
    this.view = { ...this.view, center };
  }

  /**
   * Sets the map zoom.
   */
  setZoom(zoom: number): void {
    this.view = { ...this.view, zoom };
  }

  /**
   * Fits the map to bounds.
   */
  fitBounds(
    bounds: [[number, number], [number, number]],
    options?: { padding?: number }
  ): void {
    this.engine?.fitBounds(bounds, options);
  }

  /**
   * Cleans up subscriptions.
   */
  destroy(): void {
    this.unsubscribeEngine?.();
    this.disposeReaction?.();
    this.engine = null;
  }
}

import { makeAutoObservable } from "mobx";

import type { Unsubscribe } from "../domain";
import type { IDrawEngine } from "../engines/ports";

/**
 * MobX store for drawn geometry.
 * Listens to IDrawEngine changes.
 */
export class DrawStore {
  geometry: GeoJSON.FeatureCollection | null = null;

  private engine: IDrawEngine | null = null;
  private unsubscribeEngine: Unsubscribe | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  /**
   * Binds the store to an engine and sets up sync.
   */
  bind(engine: IDrawEngine): void {
    this.engine = engine;

    // Engine → MobX: Update geometry when draw changes.
    this.unsubscribeEngine = engine.onChange((features) => {
      this.geometry = features;
    });
  }

  /**
   * Gets the current feature count.
   */
  get featureCount(): number {
    return this.geometry?.features.length ?? 0;
  }

  /**
   * Checks if there are any drawn features.
   */
  get hasFeatures(): boolean {
    return this.featureCount > 0;
  }

  /**
   * Clears all drawn geometry.
   */
  clearGeometry(): void {
    this.engine?.clear();
    this.geometry = null;
  }

  /**
   * Gets features of a specific type.
   */
  getFeaturesByType(
    type: "Point" | "LineString" | "Polygon"
  ): GeoJSON.Feature[] {
    if (!this.geometry) return [];
    return this.geometry.features.filter(
      (f: GeoJSON.Feature) => f.geometry.type === type
    );
  }

  /**
   * Cleans up subscriptions.
   */
  destroy(): void {
    this.unsubscribeEngine?.();
    this.geometry = null;
    this.engine = null;
  }
}

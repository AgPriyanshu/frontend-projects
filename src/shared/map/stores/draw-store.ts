import { makeAutoObservable, runInAction, observable } from "mobx";

import type { Unsubscribe } from "../domain";
import type { IDrawEngine } from "../engines/ports";

/**
 * MobX store for drawn geometry.
 * Listens to IDrawEngine changes.
 */
export class DrawStore {
  geometry: GeoJSON.FeatureCollection | null = null;
  featureCount: number = 0;
  hasFeatures: boolean = false;

  private engine: IDrawEngine | null = null;
  private unsubscribeEngine: Unsubscribe | null = null;

  constructor() {
    makeAutoObservable(this, {
      geometry: observable.ref,
    });
  }

  /**
   * Binds the store to an engine and sets up sync.
   */
  bind(engine: IDrawEngine): void {
    this.engine = engine;

    // Engine → MobX: Update geometry when draw changes.
    this.unsubscribeEngine = engine.onChange((features) => {
      runInAction(() => {
        this.geometry = features;
        this.featureCount = features?.features?.length || 0;
        this.hasFeatures = this.featureCount > 0;
      });
    });
  }

  /**
   * Clears all drawn geometry.
   */
  clearGeometry(): void {
    this.engine?.clear();
    runInAction(() => {
      this.geometry = null;
      this.featureCount = 0;
      this.hasFeatures = false;
    });
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
    runInAction(() => {
      this.geometry = null;
      this.featureCount = 0;
      this.hasFeatures = false;
    });
    this.engine = null;
  }
}

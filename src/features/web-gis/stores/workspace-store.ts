import { makeAutoObservable } from "mobx";

import type { IMapManager } from "../engines/ports";
import { DrawStore } from "./draw-store";
import { LayerStore } from "./layer-store";
import { MapStore } from "./map-store";
import { ToolStore } from "./tool-store";

/**
 * Root workspace store that owns all sub-stores.
 * Constructed with IMapManager and binds engine capabilities.
 */
export class WorkspaceStore {
  readonly id: string;
  readonly mapStore: MapStore;
  readonly layerStore: LayerStore;
  readonly toolStore: ToolStore;
  readonly drawStore: DrawStore;

  private mapManager: IMapManager | null = null;
  private isBound = false;

  constructor(id: string) {
    this.id = id;
    this.mapStore = new MapStore();
    this.layerStore = new LayerStore();
    this.toolStore = new ToolStore();
    this.drawStore = new DrawStore();

    makeAutoObservable(this, {
      id: false,
      mapStore: false,
      layerStore: false,
      toolStore: false,
      drawStore: false,
    });
  }

  /**
   * Binds all stores to the map manager's engine capabilities.
   * Should be called when the map manager is ready.
   */
  bindMapManager(mapManager: IMapManager): void {
    if (this.isBound) {
      console.warn("WorkspaceStore: Already bound to a map manager");
      return;
    }

    this.mapManager = mapManager;
    this.mapStore.bind(mapManager.map);
    this.layerStore.bind(mapManager.layers);
    this.toolStore.bind(mapManager.draw);
    this.drawStore.bind(mapManager.draw);
    this.isBound = true;
  }

  /**
   * Gets the current map manager.
   */
  getMapManager(): IMapManager | null {
    return this.mapManager;
  }

  /**
   * Checks if stores are bound to a map manager.
   */
  get isReady(): boolean {
    return this.isBound && (this.mapManager?.isReady() ?? false);
  }

  /**
   * Cleans up all stores and map manager.
   */
  destroy(): void {
    this.mapStore.destroy();
    this.layerStore.destroy();
    this.toolStore.destroy();
    this.drawStore.destroy();
    this.mapManager?.destroy();
    this.mapManager = null;
    this.isBound = false;
  }
}

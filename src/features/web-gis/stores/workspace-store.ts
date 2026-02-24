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

  private mapManager: IMapManager;

  constructor(id: string, createMapManager: () => IMapManager) {
    this.id = id;
    this.mapStore = new MapStore();
    this.layerStore = new LayerStore();
    this.toolStore = new ToolStore();
    this.drawStore = new DrawStore();
    this.mapManager = createMapManager();
    this.bindStores();

    makeAutoObservable(this, {
      id: false,
      mapStore: false,
      layerStore: false,
      toolStore: false,
      drawStore: false,
    });
  }

  private bindStores(): void {
    this.mapStore.bind(this.mapManager.map);
    this.layerStore.bind(this.mapManager.layers);
    this.toolStore.bind(this.mapManager.draw);
    this.drawStore.bind(this.mapManager.draw);
  }

  /**
   * Gets the current map manager.
   */
  getMapManager(): IMapManager {
    return this.mapManager;
  }

  /**
   * Checks if stores are bound to a map manager.
   */
  get isReady(): boolean {
    return this.mapManager.isReady();
  }

  /**
   * Cleans up all stores and map manager.
   */
  destroy(): void {
    this.mapStore.destroy();
    this.layerStore.destroy();
    this.toolStore.destroy();
    this.drawStore.destroy();
    this.mapManager.destroy();
  }
}

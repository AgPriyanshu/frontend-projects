import { makeAutoObservable } from "mobx";

import type { IMapAdapter } from "../engines/ports";
import { DrawStore } from "./draw-store";
import { LayerStore } from "./layer-store";
import { MapStore } from "./map-store";
import { ToolStore } from "./tool-store";

/**
 * Root workspace store that owns all sub-stores.
 * Constructed with IMapAdapter and binds engine capabilities.
 */
export class WorkspaceStore {
  readonly id: string;
  readonly mapStore: MapStore;
  readonly layerStore: LayerStore;
  readonly toolStore: ToolStore;
  readonly drawStore: DrawStore;

  private adapter: IMapAdapter | null = null;
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
   * Binds all stores to the adapter's engine capabilities.
   * Should be called when the adapter is ready.
   */
  bindAdapter(adapter: IMapAdapter): void {
    if (this.isBound) {
      console.warn("WorkspaceStore: Already bound to an adapter");
      return;
    }

    this.adapter = adapter;
    this.mapStore.bind(adapter.map);
    this.layerStore.bind(adapter.layers);
    this.toolStore.bind(adapter.draw);
    this.drawStore.bind(adapter.draw);
    this.isBound = true;
  }

  /**
   * Gets the current adapter.
   */
  getAdapter(): IMapAdapter | null {
    return this.adapter;
  }

  /**
   * Checks if stores are bound to an adapter.
   */
  get isReady(): boolean {
    return this.isBound && (this.adapter?.isReady() ?? false);
  }

  /**
   * Cleans up all stores and adapter.
   */
  destroy(): void {
    this.mapStore.destroy();
    this.layerStore.destroy();
    this.toolStore.destroy();
    this.drawStore.destroy();
    this.adapter?.destroy();
    this.adapter = null;
    this.isBound = false;
  }
}

import { makeAutoObservable, computed, reaction } from "mobx";

import { LayerModel, type SerializedLayer } from "../domain";
import type { ILayerEngine } from "../engines/ports";

/**
 * MobX store for layer management.
 * Syncs with ILayerEngine via reactions.
 */
export class LayerStore {
  layers: Map<string, LayerModel> = new Map();

  private engine: ILayerEngine | null = null;
  private disposeReaction: (() => void) | null = null;

  constructor() {
    makeAutoObservable(this, {
      serializedLayers: computed,
    });
  }

  /**
   * Binds the store to an engine and sets up sync.
   */
  bind(engine: ILayerEngine): void {
    this.engine = engine;

    // MobX → Engine: Sync layers when they change.
    this.disposeReaction = reaction(
      () => this.serializedLayers,
      (serialized) => {
        this.engine?.sync(serialized);
      },
      { fireImmediately: true }
    );
  }

  /**
   * Gets all layers as serialized format for engine sync.
   */
  get serializedLayers(): SerializedLayer[] {
    return Array.from(this.layers.values())
      .sort((a, b) => a.order - b.order)
      .map((layer) => layer.serialize());
  }

  /**
   * Gets all layers as an array.
   */
  get layersArray(): LayerModel[] {
    return Array.from(this.layers.values()).sort((a, b) => a.order - b.order);
  }

  /**
   * Adds a new layer.
   */
  addLayer(layer: LayerModel): void {
    // Set order to be at the top.
    layer.setOrder(this.layers.size);
    this.layers.set(layer.id, layer);
  }

  /**
   * Removes a layer by ID.
   */
  removeLayer(layerId: string): void {
    this.layers.delete(layerId);
    // Reorder remaining layers.
    this.reorderLayers();
  }

  /**
   * Gets a layer by ID.
   */
  getLayer(layerId: string): LayerModel | undefined {
    return this.layers.get(layerId);
  }

  /**
   * Toggles layer visibility.
   */
  toggleVisibility(layerId: string): void {
    this.layers.get(layerId)?.toggleVisibility();
  }

  /**
   * Sets layer visibility.
   */
  setVisibility(layerId: string, visible: boolean): void {
    this.layers.get(layerId)?.setVisibility(visible);
  }

  /**
   * Moves a layer to a new position.
   */
  moveLayer(layerId: string, newOrder: number): void {
    const layer = this.layers.get(layerId);
    if (!layer) return;

    const sortedLayers = this.layersArray;
    const currentIndex = sortedLayers.findIndex((l) => l.id === layerId);
    if (currentIndex === -1) return;

    // Remove from current position and insert at new position.
    sortedLayers.splice(currentIndex, 1);
    sortedLayers.splice(newOrder, 0, layer);

    // Update order values.
    sortedLayers.forEach((l, index) => l.setOrder(index));
  }

  /**
   * Fits the map to a layer's bounds.
   */
  fitToLayer(layerId: string): void {
    this.engine?.fitToLayer(layerId);
  }

  /**
   * Fits the map to specified bounds.
   */
  fitToBounds(bbox: [number, number, number, number]): void {
    this.engine?.fitToBounds(bbox);
  }

  /**
   * Clears all layers.
   */
  clear(): void {
    this.layers.clear();
  }

  private reorderLayers(): void {
    const sortedLayers = this.layersArray;
    sortedLayers.forEach((layer, index) => layer.setOrder(index));
  }

  /**
   * Cleans up subscriptions.
   */
  destroy(): void {
    this.disposeReaction?.();
    this.layers.clear();
    this.engine = null;
  }
}

/**
 * DataStore - Manages sources and layers (data/configuration layer)
 *
 * Responsibilities:
 * - Maintain sources and layers state
 * - Validate source-layer relationships
 * - Provide queries for layer/source lookups
 * - NO knowledge of map instance (pure data)
 */

import { makeAutoObservable } from "mobx";
import type { MapSource, MapLayer } from "../types";
import type { WorkspaceState } from "./types";

export class StateManager {
  state: WorkspaceState = {
    map: {
      center: [0.0, 0.0],
      zoom: 22,
    },
  };

  constructor() {
    makeAutoObservable(this);
  }

  // ===== Source Management =====

  /**
   * Add a data source to the store
   */
  addSource(source: MapSource) {
    if (this.sources.has(source.id)) {
      console.warn(`Source "${source.id}" already exists. Updating.`);
    }
    this.sources.set(source.id, source);
  }

  /**
   * Remove a source (fails if layers depend on it)
   */
  removeSource(sourceId: string) {
    // Check for dependent layers
    const dependentLayers = this.getLayersBySource(sourceId);

    if (dependentLayers.length > 0) {
      throw new Error(
        `Cannot remove source "${sourceId}". ` +
          `${dependentLayers.length} layer(s) depend on it: ` +
          `${dependentLayers.map((l) => l.id).join(", ")}`
      );
    }

    return this.sources.delete(sourceId);
  }

  /**
   * Remove source and all dependent layers (cascade delete)
   */
  removeSourceCascade(sourceId: string) {
    // Remove all dependent layers first
    const dependentLayers = this.getLayersBySource(sourceId);
    dependentLayers.forEach((layer) => this.removeLayer(layer.id));

    // Then remove source
    this.sources.delete(sourceId);
  }

  /**
   * Update source data (useful for dynamic GeoJSON sources)
   */
  updateSourceData(sourceId: string, data: GeoJSON.FeatureCollection) {
    const source = this.sources.get(sourceId);
    if (!source) {
      throw new Error(`Source "${sourceId}" not found`);
    }

    if (source.type !== "geojson") {
      throw new Error(
        `Cannot update data for non-GeoJSON source "${sourceId}"`
      );
    }

    source.data = data;
  }

  getSource(sourceId: string): MapSource | undefined {
    return this.sources.get(sourceId);
  }

  getAllSources(): MapSource[] {
    return Array.from(this.sources.values());
  }

  // ===== Layer Management =====

  /**
   * Add a layer to the store
   */
  addLayer(layer: MapLayer, beforeId?: string) {
    // Validate source exists
    if (!this.sources.has(layer.sourceId)) {
      throw new Error(
        `Cannot add layer "${layer.id}". Source "${layer.sourceId}" does not exist. ` +
          `Add the source first using addSource().`
      );
    }

    // Check if layer already exists
    if (this.layers.has(layer.id)) {
      console.warn(`Layer "${layer.id}" already exists. Updating.`);
    }

    this.layers.set(layer.id, layer);

    // Manage layer order (z-index)
    const existingIndex = this.layerOrder.indexOf(layer.id);
    if (existingIndex !== -1) {
      // Remove from current position
      this.layerOrder.splice(existingIndex, 1);
    }

    if (beforeId) {
      const beforeIndex = this.layerOrder.indexOf(beforeId);
      if (beforeIndex !== -1) {
        // Insert before specified layer
        this.layerOrder.splice(beforeIndex, 0, layer.id);
      } else {
        console.warn(`Layer "${beforeId}" not found. Adding layer to end.`);
        this.layerOrder.push(layer.id);
      }
    } else {
      // Add to end (top)
      this.layerOrder.push(layer.id);
    }
  }

  /**
   * Remove a layer from the store
   */
  removeLayer(layerId: string) {
    this.layers.delete(layerId);
    this.layerOrder = this.layerOrder.filter((id) => id !== layerId);
  }

  /**
   * Update layer properties
   */
  updateLayer(layerId: string, updates: Partial<MapLayer>) {
    const layer = this.layers.get(layerId);
    if (!layer) {
      throw new Error(`Layer "${layerId}" not found`);
    }

    // If changing sourceId, validate new source exists
    if (updates.sourceId && updates.sourceId !== layer.sourceId) {
      if (!this.sources.has(updates.sourceId)) {
        throw new Error(`Source "${updates.sourceId}" does not exist`);
      }
    }

    // Deep merge paint and layout
    const updatedLayer = {
      ...layer,
      ...updates,
      paint: updates.paint ? { ...layer.paint, ...updates.paint } : layer.paint,
      layout: updates.layout
        ? { ...layer.layout, ...updates.layout }
        : layer.layout,
      metadata: updates.metadata
        ? { ...layer.metadata, ...updates.metadata }
        : layer.metadata,
    };

    this.layers.set(layerId, updatedLayer);
  }

  /**
   * Toggle layer visibility
   */
  toggleLayerVisibility(layerId: string) {
    const layer = this.layers.get(layerId);
    if (layer) {
      layer.visible = !layer.visible;
    }
  }

  /**
   * Set layer opacity
   */
  setLayerOpacity(layerId: string, opacity: number) {
    const layer = this.layers.get(layerId);
    if (layer) {
      layer.opacity = Math.max(0, Math.min(1, opacity));
    }
  }

  /**
   * Reorder layers (for z-index control)
   */
  reorderLayers(newOrder: string[]) {
    // Validate all layer IDs exist
    const valid = newOrder.every((id) => this.layers.has(id));
    if (!valid) {
      throw new Error("Invalid layer order: some layer IDs do not exist");
    }

    // Ensure all layers are included
    if (newOrder.length !== this.layerOrder.length) {
      throw new Error("Layer order must include all existing layers");
    }

    this.layerOrder = newOrder;
  }

  /**
   * Move layer to a new position
   */
  moveLayer(layerId: string, beforeId?: string) {
    if (!this.layers.has(layerId)) {
      throw new Error(`Layer "${layerId}" not found`);
    }

    // Remove from current position
    this.layerOrder = this.layerOrder.filter((id) => id !== layerId);

    if (beforeId) {
      const beforeIndex = this.layerOrder.indexOf(beforeId);
      if (beforeIndex !== -1) {
        this.layerOrder.splice(beforeIndex, 0, layerId);
      } else {
        this.layerOrder.push(layerId);
      }
    } else {
      this.layerOrder.push(layerId);
    }
  }

  getLayer(layerId: string): MapLayer | undefined {
    return this.layers.get(layerId);
  }

  getAllLayers(): MapLayer[] {
    return Array.from(this.layers.values());
  }

  // ===== Queries =====

  /**
   * Get all layers that use a specific source
   */
  getLayersBySource(sourceId: string): MapLayer[] {
    return Array.from(this.layers.values()).filter(
      (layer) => layer.sourceId === sourceId
    );
  }

  /**
   * Get layers in rendering order
   */
  getLayersInOrder(): MapLayer[] {
    return this.layerOrder
      .map((id) => this.layers.get(id))
      .filter((layer): layer is MapLayer => layer !== undefined);
  }

  /**
   * Get only visible layers
   */
  getVisibleLayers(): MapLayer[] {
    return this.getLayersInOrder().filter((layer) => layer.visible);
  }

  /**
   * Get layers by group
   */
  getLayersByGroup(groupId: string): MapLayer[] {
    return Array.from(this.layers.values()).filter(
      (layer) => layer.metadata?.group === groupId
    );
  }

  /**
   * Get layers by type
   */
  getLayersByType(type: string): MapLayer[] {
    return Array.from(this.layers.values()).filter(
      (layer) => layer.type === type
    );
  }

  // ===== Bulk Operations =====

  /**
   * Add source and layer together (atomic operation)
   */
  addSourceWithLayer(
    source: MapSource,
    layer: Omit<MapLayer, "sourceId">,
    beforeId?: string
  ) {
    this.addSource(source);
    this.addLayer({ ...layer, sourceId: source.id } as MapLayer, beforeId);
  }

  /**
   * Add multiple sources and layers
   */
  addSourcesWithLayers(
    items: Array<{ source: MapSource; layer: Omit<MapLayer, "sourceId"> }>
  ) {
    items.forEach(({ source, layer }) => {
      this.addSource(source);
      this.addLayer({ ...layer, sourceId: source.id } as MapLayer);
    });
  }

  /**
   * Clear all sources and layers
   */
  clear() {
    this.layers.clear();
    this.sources.clear();
    this.layerOrder = [];
  }

  // ===== Statistics =====

  get sourceCount(): number {
    return this.sources.size;
  }

  get layerCount(): number {
    return this.layers.size;
  }

  get visibleLayerCount(): number {
    return this.getVisibleLayers().length;
  }
}

import { makeAutoObservable } from "mobx";

import {
  DEFAULT_LAYER_STYLE,
  type LayerStyle,
  type LayerType,
  type SerializedLayer,
} from "./types";

/**
 * Engine-agnostic layer model.
 * Contains all layer metadata and serialization logic.
 */
export class LayerModel {
  readonly id: string;
  readonly type: LayerType;

  name: string;
  source: unknown;
  style: LayerStyle;
  visible: boolean;
  order: number;
  bbox?: [number, number, number, number];

  constructor(params: {
    id: string;
    type: LayerType;
    name: string;
    source: unknown;
    style?: LayerStyle;
    visible?: boolean;
    order?: number;
    bbox?: [number, number, number, number];
  }) {
    this.id = params.id;
    this.type = params.type;
    this.name = params.name;
    this.source = params.source;
    this.style = params.style ?? { ...DEFAULT_LAYER_STYLE };
    this.visible = params.visible ?? true;
    this.order = params.order ?? 0;
    this.bbox = params.bbox;

    makeAutoObservable(this, {
      id: false,
      type: false,
    });
  }

  /**
   * Serializes the layer for engine syncing.
   */
  serialize(): SerializedLayer {
    return {
      id: this.id,
      type: this.type,
      data: this.source,
      style: { ...this.style },
      visible: this.visible,
      order: this.order,
      bbox: this.bbox,
    };
  }

  /**
   * Updates the layer style.
   */
  setStyle(style: Partial<LayerStyle>): void {
    this.style = { ...this.style, ...style };
  }

  /**
   * Toggles layer visibility.
   */
  toggleVisibility(): void {
    this.visible = !this.visible;
  }

  /**
   * Sets layer visibility.
   */
  setVisibility(visible: boolean): void {
    this.visible = visible;
  }

  /**
   * Sets layer order.
   */
  setOrder(order: number): void {
    this.order = order;
  }

  /**
   * Creates a LayerModel from serialized data.
   */
  static fromSerialized(serialized: SerializedLayer, name: string): LayerModel {
    return new LayerModel({
      id: serialized.id,
      type: serialized.type,
      name,
      source: serialized.data,
      style: serialized.style,
      visible: serialized.visible,
      order: serialized.order,
      bbox: serialized.bbox,
    });
  }
}

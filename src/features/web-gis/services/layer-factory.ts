import {
  buildTileUrl,
  DATASET_TYPES,
  RASTER_KINDS,
  TILESET_STATUSES,
  type LayerResponse,
} from "api/web-gis";

import { LayerModel } from "../domain";

export class LayerFactory {
  static isReadyRasterLayer(apiLayer: LayerResponse): boolean {
    return (
      apiLayer.datasetType === DATASET_TYPES.RASTER &&
      !!apiLayer.tileset &&
      apiLayer.tileset.status === TILESET_STATUSES.READY
    );
  }

  static createRasterLayer(apiLayer: LayerResponse): LayerModel | null {
    if (!LayerFactory.isReadyRasterLayer(apiLayer)) {
      return null;
    }

    const tileUrl = buildTileUrl(apiLayer.source, {
      terrain: apiLayer.rasterKind === RASTER_KINDS.ELEVATION,
    });

    const bbox =
      apiLayer.bbox ??
      (apiLayer.tileset?.bounds as [number, number, number, number] | null) ??
      undefined;

    return new LayerModel({
      id: apiLayer.id,
      type: DATASET_TYPES.RASTER,
      name: apiLayer.name,
      source: [tileUrl],
      rasterKind: apiLayer.rasterKind ?? RASTER_KINDS.RASTER,
      bbox,
    });
  }
}

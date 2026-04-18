import {
  buildTileUrl,
  buildVectorTileUrl,
  DatasetType,
  RasterKind,
  TilesetStatus,
  type LayerResponse,
} from "api/web-gis";

import { LayerModel } from "../domain";

export class LayerFactory {
  static isReadyRasterLayer(apiLayer: LayerResponse): boolean {
    return (
      apiLayer.datasetType === DatasetType.RASTER &&
      !!apiLayer.tileset &&
      apiLayer.tileset.status === TilesetStatus.READY
    );
  }

  static createRasterLayer(apiLayer: LayerResponse): LayerModel | null {
    if (!LayerFactory.isReadyRasterLayer(apiLayer)) {
      return null;
    }

    const tileUrl = buildTileUrl(apiLayer.source, {
      terrain: apiLayer.rasterKind === RasterKind.ELEVATION,
    });

    const bbox =
      apiLayer.bbox ??
      (apiLayer.tileset?.bounds as [number, number, number, number] | null) ??
      undefined;

    return new LayerModel({
      id: apiLayer.id,
      type: DatasetType.RASTER,
      name: apiLayer.name,
      source: [tileUrl],
      rasterKind: apiLayer.rasterKind ?? RasterKind.RASTER,
      bbox,
    });
  }

  static createVectorLayer(apiLayer: LayerResponse): LayerModel | null {
    return new LayerModel({
      id: apiLayer.id,
      type: DatasetType.VECTOR,
      name: apiLayer.name,
      source: buildVectorTileUrl(apiLayer.source),
      datasetId: apiLayer.source,
      bbox: apiLayer.bbox ?? undefined,
    });
  }
}

import { type LayerResponse, DatasetType } from "api/web-gis";
import { toaster } from "design-system/toaster";
import { LayerFactory } from "../../services";
import type { WorkspaceStore } from "shared/map/stores";

export const addLayerToMap = (
  apiLayer: LayerResponse,
  workspace: WorkspaceStore
) => {
  try {
    switch (apiLayer.datasetType) {
      case DatasetType.RASTER: {
        const layer = LayerFactory.createRasterLayer(apiLayer);

        if (!layer) {
          toaster.create({
            title: "Layer not ready",
            description: `Tiles for "${apiLayer.name}" are still processing. Try again shortly.`,
            type: "error",
          });

          return;
        }

        workspace.layerStore.addLayer(layer);

        if (apiLayer.tileset?.bounds) {
          workspace.layerStore.fitToBounds(
            apiLayer.tileset.bounds as [number, number, number, number]
          );
        }
        break;
      }

      case DatasetType.VECTOR: {
        const layer = LayerFactory.createVectorLayer(apiLayer);

        if (!layer) {
          return;
        }

        workspace.layerStore.addLayer(layer);

        if (apiLayer.bbox) {
          workspace.layerStore.fitToBounds(
            apiLayer.bbox as [number, number, number, number]
          );
        }
        break;
      }

      default:
        break;
    }
  } catch (err) {
    console.error(`Error loading layer ${apiLayer.name}:`, err);
  }
};

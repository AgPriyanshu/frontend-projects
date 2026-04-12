import {
  type LayerResponse,
  DatasetType,
  fetchFeaturesAsGeoJSON,
} from "api/web-gis";
import { LayerFactory } from "../../services";
import type { WorkspaceStore } from "../../stores";

export const addLayerToMap = async (
  apiLayer: LayerResponse,
  workspace: WorkspaceStore
) => {
  try {
    switch (apiLayer.datasetType) {
      case DatasetType.RASTER: {
        const layer = LayerFactory.createRasterLayer(apiLayer);

        if (!layer) {
          console.info(
            `Skipping raster layer until tiles are ready: ${apiLayer.name} (status: ${
              apiLayer.tileset?.status ?? "missing"
            })`
          );
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
        console.log({ apiLayer });
        const data = await fetchFeaturesAsGeoJSON(apiLayer.source);
        const layer = LayerFactory.createVectorLayer(apiLayer, data);

        if (!layer) {
          return;
        }

        workspace.layerStore.addLayer(layer);
        break;
      }

      default:
        break;
    }
  } catch (err) {
    console.error(`Error loading layer ${apiLayer.name}:`, err);
  }
};

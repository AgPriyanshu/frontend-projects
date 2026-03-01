import { Box } from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { useCallback, useEffect, useRef, useState } from "react";

import type { ApiResponse } from "api/types";
import { DATASET_TYPES, useAddLayer, type LayerResponse } from "api/web-gis";
import { LayerFactory } from "../services";
import { workspaceManager } from "../stores";

interface MapCanvasProps {
  workspaceId: string;
  onReady?: () => void;
}

export const MapCanvas = observer(
  ({ workspaceId, onReady }: MapCanvasProps) => {
    // Refs.
    const containerRef = useRef<HTMLDivElement>(null);

    // States.
    const [isDragging, setIsDragging] = useState(false);

    // Variables.
    const workspace = workspaceManager.getOrCreateWorkspace(workspaceId);

    // APIs.
    const { mutate: createLayer } = useAddLayer();

    useEffect(() => {
      if (!containerRef.current) {
        return;
      }

      // Get and mount the workspace map manager.
      const mapManager = workspace.getMapManager();

      mapManager.mount(containerRef.current);

      // Wait for map to be ready, then bind stores.
      const checkReady = setInterval(() => {
        if (mapManager.isReady()) {
          clearInterval(checkReady);
          onReady?.();
        }
      }, 100);

      return () => {
        clearInterval(checkReady);
        mapManager.destroy();
      };
    }, [workspace, onReady]);

    // Handlers.
    const addLayerToMap = useCallback(
      async (apiLayer: LayerResponse) => {
        try {
          switch (apiLayer.datasetType) {
            case DATASET_TYPES.RASTER: {
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

            default:
              break;
          }
        } catch (err) {
          console.error(`Error loading layer ${apiLayer.name}:`, err);
        }
      },
      [workspace]
    );

    const handleDragOver = useCallback(
      (dragEvent: React.DragEvent<HTMLDivElement>) => {
        dragEvent.preventDefault();
        dragEvent.stopPropagation();
        setIsDragging(true);
      },
      []
    );

    const handleDragLeave = useCallback(
      (dragEvent: React.DragEvent<HTMLDivElement>) => {
        dragEvent.preventDefault();
        dragEvent.stopPropagation();
        setIsDragging(false);
      },
      []
    );

    const handleDrop = useCallback(
      async (dragEvent: React.DragEvent<HTMLDivElement>) => {
        dragEvent.preventDefault();
        dragEvent.stopPropagation();
        setIsDragging(false);

        // Check if it's a dataset node being dropped.
        const datasetId = dragEvent.dataTransfer.getData(
          "application/dataset-id"
        );
        const datasetName = dragEvent.dataTransfer.getData(
          "application/dataset-name"
        );

        if (datasetId) {
          // Handle dataset node drop — create layer via API, then load on map.
          createLayer(
            {
              name: datasetName || `Layer ${datasetId}`,
              source: datasetId,
            },
            {
              onSuccess: async (response) => {
                const apiLayer = (response.data as ApiResponse<LayerResponse>)
                  .data;
                await addLayerToMap(apiLayer);
              },
            }
          );
          return;
        }
      },
      [addLayerToMap, createLayer]
    );

    return (
      <Box
        ref={containerRef}
        w="100%"
        h="100%"
        position="relative"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        border={isDragging ? "2px dashed" : "none"}
        borderColor="blue.500"
        transition="border 0.2s ease"
      >
        {isDragging && (
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bg="rgba(0, 136, 136, 0.1)"
            display="flex"
            alignItems="center"
            justifyContent="center"
            zIndex={1000}
            pointerEvents="none"
          >
            <Box
              p="2rem"
              bg="bg.panel"
              borderRadius="lg"
              border="2px dashed"
              borderColor="blue.500"
              fontSize="1.2rem"
              fontWeight="600"
            >
              Drop dataset here to add as layer
            </Box>
          </Box>
        )}
      </Box>
    );
  }
);

MapCanvas.displayName = "MapCanvas";

import { Box } from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { useCallback, useEffect, useRef, useState } from "react";

import type { ApiResponse } from "api/types";
import { useAddLayer, type LayerResponse } from "api/web-gis";
import { workspaceManager } from "shared/map/stores";
import { addLayerToMap } from "./helpers";

interface MapCanvasProps {
  workspaceId: string;
}

export const MapCanvas = observer(({ workspaceId }: MapCanvasProps) => {
  // Refs.
  const containerRef = useRef<HTMLDivElement>(null);

  // States.
  const [isDragging, setIsDragging] = useState(false);

  // Variables.
  const workspace = workspaceManager.getOrCreateWorkspace(workspaceId);

  // APIs.
  const { mutate: sendCreateLayer } = useAddLayer();

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const mapManager = workspace.getMapManager();

    mapManager.mount(containerRef.current);

    return () => {
      mapManager.destroy();
    };
  }, [workspace]);

  // Handlers.
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
        sendCreateLayer(
          {
            name: datasetName || `Layer ${datasetId}`,
            source: datasetId,
          },
          {
            onSuccess: async (response) => {
              const apiLayer = (response.data as ApiResponse<LayerResponse>)
                .data;
              addLayerToMap(apiLayer, workspace);
            },
          }
        );
        return;
      }
    },
    [sendCreateLayer, workspace]
  );

  return (
    <Box
      className="map-canvas"
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
          className="map-canvas-drop-overlay"
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
            className="map-canvas-drop-hint"
            p="2rem"
            bg="surface.container"
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
});

MapCanvas.displayName = "MapCanvas";

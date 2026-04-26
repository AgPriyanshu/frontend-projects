import { Box, Flex, IconButton, Text, VStack } from "@chakra-ui/react";
import {
  DatasetType,
  RasterKind,
  useDeleteLayer,
  useLayers,
} from "api/web-gis";
import { observer } from "mobx-react-lite";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { FiEye, FiEyeOff, FiZoomIn } from "react-icons/fi";
import { TbMap2, TbVector } from "react-icons/tb";

import { DeleteIconButton } from "shared/components";
import { LayerFactory } from "../services";
import { workspaceManager } from "shared/map/stores";

export const LayerPanel = observer(() => {
  // APIs.
  const { data: layersData, isLoading, error } = useLayers();
  const { mutate: deleteLayer, isPending: isDeleting } = useDeleteLayer();

  // Variables
  const workspace = workspaceManager.activeWorkspace;
  const apiLayers = useMemo(() => layersData?.data ?? [], [layersData?.data]);
  const storeLayers = useMemo(
    () => workspace?.layerStore?.layersArray ?? [],
    [workspace?.layerStore?.layersArray]
  );

  // Refs.
  const isSyncingRef = useRef(false);

  // Helpers.
  const syncLayers = useCallback(async () => {
    if (!workspace?.layerStore || isSyncingRef.current) {
      return;
    }

    isSyncingRef.current = true;

    try {
      const apiLayerIds = new Set(apiLayers.map((layer) => layer.id));

      for (const apiLayer of apiLayers) {
        if (workspace.layerStore.getLayer(apiLayer.id)) {
          continue;
        }

        try {
          if (apiLayer.datasetType === DatasetType.RASTER) {
            const layer = LayerFactory.createRasterLayer(apiLayer);

            if (layer) {
              workspace.layerStore.addLayer(layer);
            }
          } else if (apiLayer.datasetType === DatasetType.VECTOR) {
            const layer = LayerFactory.createVectorLayer(apiLayer);

            if (layer) {
              workspace.layerStore.addLayer(layer);
            }
          } else {
            console.info(`Skipping unsupported layer: ${apiLayer.name}`);
          }
        } catch (err) {
          console.error(`Error loading layer ${apiLayer.name}:`, err);
        }
      }

      // Remove stale layers from the store if they no longer exist in API.
      for (const storeLayer of workspace.layerStore.layersArray) {
        if (!apiLayerIds.has(storeLayer.id)) {
          workspace.layerStore.removeLayer(storeLayer.id);
        }
      }
    } finally {
      isSyncingRef.current = false;
    }
  }, [apiLayers, workspace]);

  // useEffects.
  useEffect(() => {
    if (!workspace?.layerStore || apiLayers.length === 0) {
      return;
    }

    void syncLayers();
  }, [apiLayers.length, syncLayers]);

  // Handlers.
  const handleDelete = (layerId: string) => {
    deleteLayer(layerId);
    workspace?.layerStore?.removeLayer(layerId);
  };

  const handleToggleVisibility = (layerId: string) => {
    workspace?.layerStore?.toggleVisibility(layerId);
  };

  const handleFitToLayer = (layerId: string) => {
    const storeLayer = workspace?.layerStore?.getLayer(layerId);

    if (storeLayer?.bbox) {
      workspace?.layerStore?.fitToBounds(storeLayer.bbox);
    } else {
      workspace?.layerStore?.fitToLayer(layerId);
    }
  };

  // Renderers.
  if (isLoading) {
    return (
      <Box
        className="layer-panel layer-panel-loading"
        p="1rem"
        color="fg.muted"
        textAlign="center"
      >
        <Text fontSize="sm">Loading layers...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        className="layer-panel layer-panel-error"
        p="1rem"
        color="fg.error"
        textAlign="center"
      >
        <Text fontSize="sm">Failed to load layers.</Text>
      </Box>
    );
  }

  if (storeLayers.length === 0) {
    return (
      <Box
        className="layer-panel layer-panel-empty"
        p="1rem"
        color="fg.muted"
        textAlign="center"
      >
        <Text fontSize="sm">No layers added yet.</Text>
        <Text fontSize="xs" mt="0.5rem">
          Drag a dataset onto the map to create a layer.
        </Text>
      </Box>
    );
  }

  return (
    <VStack className="layer-panel" gap="0.5rem" p="0.5rem" align="stretch">
      {storeLayers.map((storeLayer) => {
        const isVisible = storeLayer.visible;
        const isRasterLayer = storeLayer.type === DatasetType.RASTER;
        const isElevationRaster =
          isRasterLayer && storeLayer.rasterKind === RasterKind.ELEVATION;

        return (
          <Flex
            key={storeLayer.id}
            className="layer-panel-item"
            p="0.5rem"
            borderRadius="md"
            bg="bg.subtle"
            alignItems="center"
            gap="0.5rem"
            _hover={{ bg: "bg.muted" }}
          >
            {/* Visibility toggle. */}
            <IconButton
              aria-label={isVisible ? "Hide layer" : "Show layer"}
              size="xs"
              variant="ghost"
              onClick={() => handleToggleVisibility(storeLayer.id)}
            >
              {isVisible ? <FiEye /> : <FiEyeOff />}
            </IconButton>

            {/* Layer type icon + name. */}
            <Flex align="center" gap="0.375rem" flex={1}>
              <Box
                as="span"
                color={isRasterLayer ? "green.400" : "blue.400"}
                fontSize="sm"
                flexShrink={0}
              >
                {isRasterLayer ? <TbMap2 /> : <TbVector />}
              </Box>
              <Text
                fontSize="sm"
                fontWeight="medium"
                truncate
                opacity={isVisible ? 1 : 0.5}
              >
                {storeLayer.name}
              </Text>
            </Flex>

            {/* Zoom to layer. */}
            <IconButton
              aria-label="Zoom to layer"
              size="xs"
              variant="ghost"
              onClick={() => handleFitToLayer(storeLayer.id)}
            >
              <FiZoomIn />
            </IconButton>

            {isElevationRaster && (
              <IconButton
                aria-label={
                  storeLayer.terrainEnabled
                    ? "Disable terrain"
                    : "Enable terrain"
                }
                size="xs"
                variant="ghost"
                colorPalette={storeLayer.terrainEnabled ? "green" : "gray"}
                onClick={() =>
                  workspace?.layerStore?.toggleTerrain(storeLayer.id)
                }
              >
                <Text fontSize="2xs" fontWeight="bold">
                  3D
                </Text>
              </IconButton>
            )}

            {/* Remove layer. */}
            <DeleteIconButton
              onClick={() => handleDelete(storeLayer.id)}
              loading={isDeleting}
            />
          </Flex>
        );
      })}
    </VStack>
  );
});

LayerPanel.displayName = "LayerPanel";

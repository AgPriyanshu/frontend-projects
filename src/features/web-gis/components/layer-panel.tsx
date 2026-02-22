import { Box, Flex, IconButton, Text, VStack } from "@chakra-ui/react";
import type { LayerResponse } from "api/web-gis";
import {
  buildTileUrl,
  fetchLayerGeoJSON,
  useDeleteLayer,
  useLayers,
} from "api/web-gis";
import { observer } from "mobx-react-lite";
import { useEffect, useMemo } from "react";
import { FiEye, FiEyeOff, FiTrash2, FiZoomIn } from "react-icons/fi";
import { TbMap2, TbVector } from "react-icons/tb";

import { LayerModel } from "../domain";
import { workspaceManager } from "../stores";

export const LayerPanel = observer(() => {
  // Get workspace.
  const workspace = workspaceManager.activeWorkspace;
  const layerStore = workspace?.layerStore;

  // API hooks.
  const { data: layersData, isLoading, error } = useLayers();
  const { mutate: deleteLayer, isPending: isDeleting } = useDeleteLayer();

  const apiLayers: LayerResponse[] = useMemo(
    () => layersData?.data ?? [],
    [layersData?.data]
  );

  // Sync API layers to LayerStore (for map rendering).
  useEffect(() => {
    if (!layerStore || apiLayers.length === 0) return;

    const syncLayers = async () => {
      for (const apiLayer of apiLayers) {
        // Skip if layer already exists in store.
        if (layerStore.getLayer(apiLayer.id)) continue;

        try {
          // Raster layers: use XYZ tile URL.
          if (apiLayer.datasetType === "raster") {
            if (!apiLayer.tileset || apiLayer.tileset.status !== "ready") {
              console.info(
                `Skipping raster layer until tiles are ready: ${apiLayer.name} (status: ${
                  apiLayer.tileset?.status ?? "missing"
                })`
              );
              continue;
            }

            const tileUrl = buildTileUrl(apiLayer.source, {
              terrain: apiLayer.rasterKind === "elevation",
            });
            const rasterBbox =
              apiLayer.bbox ??
              (apiLayer.tileset?.bounds as
                | [number, number, number, number]
                | null) ??
              undefined;
            const layer = new LayerModel({
              id: apiLayer.id,
              type: "raster",
              name: apiLayer.name,
              source: [tileUrl],
              rasterKind: apiLayer.rasterKind ?? "raster",
              bbox: rasterBbox,
            });

            layerStore.addLayer(layer);
            continue;
          }

          // Vector/GeoJSON layers: fetch features.
          const geojson = await fetchLayerGeoJSON(apiLayer.id, apiLayer.source);

          // Skip if no features.
          if (!geojson?.features || geojson.features.length === 0) {
            console.warn(`No features found for layer ${apiLayer.name}`);
            continue;
          }

          // Create LayerModel and add to store.
          const layer = new LayerModel({
            id: apiLayer.id,
            type: "geojson",
            name: apiLayer.name,
            source: geojson,
            bbox: apiLayer.bbox || undefined,
          });

          layerStore.addLayer(layer);
        } catch (err) {
          console.error(`Error loading layer ${apiLayer.name}:`, err);
        }
      }
    };

    syncLayers();
  }, [apiLayers, layerStore]);

  // Loading state.
  if (isLoading) {
    return (
      <Box p="1rem" color="fg.muted" textAlign="center">
        <Text fontSize="sm">Loading layers...</Text>
      </Box>
    );
  }

  // Error state.
  if (error) {
    return (
      <Box p="1rem" color="fg.error" textAlign="center">
        <Text fontSize="sm">Failed to load layers.</Text>
      </Box>
    );
  }

  // Empty state.
  if (apiLayers.length === 0) {
    return (
      <Box p="1rem" color="fg.muted" textAlign="center">
        <Text fontSize="sm">No layers added yet.</Text>
        <Text fontSize="xs" mt="0.5rem">
          Drag a dataset onto the map to create a layer.
        </Text>
      </Box>
    );
  }

  // Handlers.
  const handleDelete = (layerId: string) => {
    // Delete from API.
    deleteLayer(layerId);
    // Remove from local store.
    layerStore?.removeLayer(layerId);
  };

  const handleToggleVisibility = (layerId: string) => {
    layerStore?.toggleVisibility(layerId);
  };

  const handleFitToLayer = (layerId: string) => {
    // Try to use bbox from API layer (more efficient).
    const apiLayer = apiLayers.find((l) => l.id === layerId);

    if (apiLayer?.bbox) {
      layerStore?.fitToBounds(apiLayer.bbox);
    } else {
      // Fallback to calculating from GeoJSON data.
      layerStore?.fitToLayer(layerId);
    }
  };

  return (
    <VStack gap="0.5rem" p="0.5rem" align="stretch">
      {apiLayers.map((apiLayer) => {
        // Get MobX model for visibility state (if synced).
        const storeLayer = layerStore?.getLayer(apiLayer.id);
        const isVisible = storeLayer?.visible ?? true;

        return (
          <Flex
            key={apiLayer.id}
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
              onClick={() => handleToggleVisibility(apiLayer.id)}
            >
              {isVisible ? <FiEye /> : <FiEyeOff />}
            </IconButton>

            {/* Layer type icon + name. */}
            <Flex align="center" gap="0.375rem" flex={1}>
              <Box
                as="span"
                color={
                  apiLayer.datasetType === "raster" ? "green.400" : "blue.400"
                }
                fontSize="sm"
                flexShrink={0}
              >
                {apiLayer.datasetType === "raster" ? <TbMap2 /> : <TbVector />}
              </Box>
              <Text
                fontSize="sm"
                fontWeight="medium"
                truncate
                opacity={isVisible ? 1 : 0.5}
              >
                {apiLayer.name}
              </Text>
            </Flex>

            {/* Zoom to layer. */}
            <IconButton
              aria-label="Zoom to layer"
              size="xs"
              variant="ghost"
              onClick={() => handleFitToLayer(apiLayer.id)}
            >
              <FiZoomIn />
            </IconButton>

            {apiLayer.datasetType === "raster" &&
              apiLayer.rasterKind === "elevation" && (
                <IconButton
                  aria-label={
                    storeLayer?.terrainEnabled
                      ? "Disable terrain"
                      : "Enable terrain"
                  }
                  size="xs"
                  variant="ghost"
                  colorPalette={storeLayer?.terrainEnabled ? "green" : "gray"}
                  onClick={() => layerStore?.toggleTerrain(apiLayer.id)}
                >
                  <Text fontSize="2xs" fontWeight="bold">
                    3D
                  </Text>
                </IconButton>
              )}

            {/* Remove layer. */}
            <IconButton
              aria-label="Remove layer"
              size="xs"
              variant="ghost"
              colorPalette="red"
              onClick={() => handleDelete(apiLayer.id)}
              loading={isDeleting}
            >
              <FiTrash2 />
            </IconButton>
          </Flex>
        );
      })}
    </VStack>
  );
});

LayerPanel.displayName = "LayerPanel";

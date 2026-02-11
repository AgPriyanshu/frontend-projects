import { Box, Flex, IconButton, Text, VStack } from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import { useDeleteLayer, useLayers } from "api/web-gis";
import type { LayerResponse } from "api/web-gis";
import { FiEye, FiEyeOff, FiTrash2, FiZoomIn } from "react-icons/fi";

import { LayerModel } from "../domain";
import { workspaceManager } from "../stores";

export const LayerPanel = observer(() => {
  // Get workspace.
  const workspace = workspaceManager.activeWorkspace;
  const layerStore = workspace?.layerStore;

  // API hooks.
  const { data: layersData, isLoading, error, refetch } = useLayers();
  const { mutate: deleteLayer, isPending: isDeleting } = useDeleteLayer();

  const apiLayers: LayerResponse[] = layersData?.data ?? [];

  // Listen for layer-created events (from drag-drop) to refetch.
  useEffect(() => {
    const handleLayerCreated = () => {
      refetch();
    };
    window.addEventListener("layer-created", handleLayerCreated);
    return () =>
      window.removeEventListener("layer-created", handleLayerCreated);
  }, [refetch]);

  // Sync API layers to LayerStore.
  useEffect(() => {
    if (!layerStore || apiLayers.length === 0) return;

    const syncLayers = async () => {
      for (const apiLayer of apiLayers) {
        // Skip if layer already exists in store.
        if (layerStore.getLayer(apiLayer.id)) continue;

        try {
          // Fetch GeoJSON data from layer's PostGIS features.
          const response = await fetch(
            `${import.meta.env.VITE_API_BASE_URL}/web-gis/layers/${apiLayer.id}/geojson/`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
              },
            }
          );

          if (!response.ok) {
            console.error(`Failed to fetch data for layer ${apiLayer.name}`);
            continue;
          }

          let geojson = await response.json();

          // Fallback: If no features in PostGIS, try downloading the original file.
          if (!geojson.features || geojson.features.length === 0) {
            console.log(
              `No PostGIS features for ${apiLayer.name}, falling back to file download`
            );
            const fallbackResponse = await fetch(
              `${import.meta.env.VITE_API_BASE_URL}/web-gis/datasets/${apiLayer.source}/download`,
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                },
              }
            );

            if (fallbackResponse.ok) {
              geojson = await fallbackResponse.json();
            }
          }

          // Skip if still no features.
          if (!geojson.features || geojson.features.length === 0) {
            console.warn(`No features found for layer ${apiLayer.name}`);
            continue;
          }

          // Create LayerModel and add to store.
          const layer = new LayerModel({
            id: apiLayer.id,
            type: "geojson",
            name: apiLayer.name,
            source: geojson,
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

  // Use layers from LayerStore for display (they have full data).
  const layers = layerStore?.layersArray ?? [];

  // Empty state.
  if (layers.length === 0) {
    return (
      <Box p="1rem" color="fg.muted" textAlign="center">
        <Text fontSize="sm">No layers added yet.</Text>
        <Text fontSize="xs" mt="0.5rem">
          Click the add icon on a dataset to create a layer.
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
      {layers.map((layer) => (
        <Flex
          key={layer.id}
          p="0.5rem"
          borderRadius="md"
          bg="bg.subtle"
          alignItems="center"
          gap="0.5rem"
          _hover={{ bg: "bg.muted" }}
        >
          {/* Visibility toggle. */}
          <IconButton
            aria-label={layer.visible ? "Hide layer" : "Show layer"}
            size="xs"
            variant="ghost"
            onClick={() => handleToggleVisibility(layer.id)}
          >
            {layer.visible ? <FiEye /> : <FiEyeOff />}
          </IconButton>

          {/* Layer name. */}
          <Text
            flex={1}
            fontSize="sm"
            fontWeight="medium"
            truncate
            opacity={layer.visible ? 1 : 0.5}
          >
            {layer.name}
          </Text>

          {/* Zoom to layer. */}
          <IconButton
            aria-label="Zoom to layer"
            size="xs"
            variant="ghost"
            onClick={() => handleFitToLayer(layer.id)}
          >
            <FiZoomIn />
          </IconButton>

          {/* Remove layer. */}
          <IconButton
            aria-label="Remove layer"
            size="xs"
            variant="ghost"
            colorPalette="red"
            onClick={() => handleDelete(layer.id)}
            loading={isDeleting}
          >
            <FiTrash2 />
          </IconButton>
        </Flex>
      ))}
    </VStack>
  );
});

LayerPanel.displayName = "LayerPanel";

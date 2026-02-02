import { Box, Flex, IconButton, Text, VStack } from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { FiEye, FiEyeOff, FiTrash2, FiZoomIn } from "react-icons/fi";

import { workspaceManager } from "../stores";

interface LayerPanelProps {
  /** Workspace ID this panel belongs to. */
  workspaceId: string;
}

/**
 * Layer panel component for managing map layers.
 * Allows visibility toggling, zooming to layer, and removal.
 */
export const LayerPanel = observer(({ workspaceId }: LayerPanelProps) => {
  const workspace = workspaceManager.getWorkspace(workspaceId);
  if (!workspace) return null;

  const layerStore = workspace.layerStore;
  const layers = layerStore.layersArray;

  if (layers.length === 0) {
    return (
      <Box p="1rem" color="fg.muted" textAlign="center">
        <Text fontSize="sm">No layers added yet.</Text>
        <Text fontSize="xs" mt="0.5rem">
          Drag and drop a GeoJSON file onto the map.
        </Text>
      </Box>
    );
  }

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
            onClick={() => layerStore.toggleVisibility(layer.id)}
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
            onClick={() => layerStore.fitToLayer(layer.id)}
          >
            <FiZoomIn />
          </IconButton>

          {/* Remove layer. */}
          <IconButton
            aria-label="Remove layer"
            size="xs"
            variant="ghost"
            colorPalette="red"
            onClick={() => layerStore.removeLayer(layer.id)}
          >
            <FiTrash2 />
          </IconButton>
        </Flex>
      ))}
    </VStack>
  );
});

LayerPanel.displayName = "LayerPanel";

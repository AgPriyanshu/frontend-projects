import { Box, Flex, IconButton } from "@chakra-ui/react";
import { Tooltip } from "src/design-system";
import { useState } from "react";
import { SaveFeaturesModal } from "./save-features-modal";
import { observer } from "mobx-react-lite";
import { FaMapMarkerAlt } from "react-icons/fa";
import { PiPolygonFill } from "react-icons/pi";
import { TbLine, TbPointer } from "react-icons/tb";
import { FiSave } from "react-icons/fi";
import { DeleteIconButton } from "shared/components";
import { toaster } from "design-system/toaster";
import {
  type LayerResponse,
  useSaveFeatures,
  fetchFeaturesAsGeoJSON,
} from "api/web-gis";
import { LayerFactory } from "../../services";
import { workspaceManager } from "../../stores";
import { ToolButton } from "./tool-button";

interface ToolbarProps {
  workspaceId: string;
}

export const Toolbar = observer(({ workspaceId }: ToolbarProps) => {
  // States.
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Variables.
  const workspace = workspaceManager.getWorkspace(workspaceId);

  if (!workspace) {
    return null;
  }
  const { toolStore, drawStore, layerStore } = workspace;

  // APIs.
  const { mutateAsync: saveFeatures } = useSaveFeatures();

  // Handlers.
  const handleSave = async () => {
    const activeLayer = layerStore.activeLayer;

    if (!activeLayer?.datasetId) {
      setIsModalOpen(true);
      return;
    }

    const features = drawStore.geometry?.features ?? [];

    if (features.length === 0) {
      return;
    }

    try {
      setIsSaving(true);
      await saveFeatures({ dataset: activeLayer.datasetId, features });
      const updatedData = await fetchFeaturesAsGeoJSON(activeLayer.datasetId);
      activeLayer.updateSource(updatedData);
      drawStore.clearGeometry();
      toaster.create({
        title: "Features saved",
        type: "success",
        description: `Saved ${features.length} feature(s) to ${activeLayer.name}.`,
      });
    } catch (err: any) {
      toaster.create({
        title: "Error saving features",
        type: "error",
        description: err.message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleModalComplete = async (apiLayer: LayerResponse) => {
    const layer = LayerFactory.createVectorLayer(apiLayer);

    if (layer) {
      layerStore.addLayer(layer);
      layerStore.setActiveLayer(layer.id);
    }

    drawStore.clearGeometry();
  };

  // Render.
  return (
    <Box
      className="toolbar-container"
      position={"absolute"}
      top={"1rem"}
      left={"1rem"}
    >
      <Flex className="toolbar" direction="row" gap="0.5rem">
        <Flex
          className="toolbar-draw-tools"
          direction="row"
          gap="0.25rem"
          p="0.25rem"
          bg="bg.panel"
          borderRadius="xl"
          boxShadow="md"
          borderWidth="1px"
          borderColor="border.subtle"
        >
          <ToolButton
            mode="select"
            icon={<TbPointer />}
            label="Select"
            toolStore={toolStore}
          />
          <ToolButton
            mode="polygon"
            icon={<PiPolygonFill />}
            label="Polygon"
            toolStore={toolStore}
          />
          <ToolButton
            mode="linestring"
            icon={<TbLine />}
            label="Line"
            toolStore={toolStore}
          />
          <ToolButton
            mode="point"
            icon={<FaMapMarkerAlt />}
            label="Point"
            toolStore={toolStore}
          />
        </Flex>

        {drawStore.hasFeatures && (
          <Flex
            className="toolbar-feature-actions"
            direction="row"
            p="0.25rem"
            bg="bg.panel"
            borderRadius="xl"
            boxShadow="md"
            borderWidth="1px"
            gap="0.25rem"
          >
            <Tooltip content="Clear all drawings">
              <DeleteIconButton
                aria-label="Clear drawings"
                onClick={() => drawStore.clearGeometry()}
              />
            </Tooltip>

            <Tooltip content="Save drawings to dataset">
              <IconButton
                size="xs"
                variant="plain"
                color="icon.success"
                _hover={{ color: "green.600" }}
                aria-label="Save drawings"
                onClick={handleSave}
                loading={isSaving}
                disabled={isSaving}
              >
                <FiSave />
              </IconButton>
            </Tooltip>
          </Flex>
        )}

        {/* Missing Layer Modal / Feature Save Worklfow */}
        <SaveFeaturesModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          features={(drawStore.geometry?.features as GeoJSON.Feature[]) || []}
          onComplete={handleModalComplete}
        />
      </Flex>
    </Box>
  );
});

Toolbar.displayName = "Toolbar";

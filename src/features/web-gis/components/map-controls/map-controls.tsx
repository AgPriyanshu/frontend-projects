import { Flex, IconButton, Separator } from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import {
  TbArrowsMaximize,
  TbGlobe,
  TbMinus,
  TbNavigation,
  TbPlus,
} from "react-icons/tb";
import { Tooltip } from "src/design-system";

import { workspaceManager } from "shared/map/stores";
import { controlButtonStyles, panelStyles } from "./styles";

interface MapControlsProps {
  workspaceId: string;
}

export const MapControls = observer(({ workspaceId }: MapControlsProps) => {
  // Variables
  const workspace = workspaceManager.getWorkspace(workspaceId);

  if (!workspace) {
    return null;
  }

  const { mapStore } = workspace;

  // Handlers.
  const handleFullscreen = () => {
    const el = document.fullscreenElement;
    if (el) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  };

  return (
    <Flex
      direction={"column"}
      position="absolute"
      top="0.75rem"
      right="0.75rem"
      zIndex={100}
      gap={"0.5rem"}
    >
      <Flex className="map-controls" direction="column" gap="0.5rem">
        {/* Zoom + North reset group */}
        <Flex className="map-controls-zoom-group" {...panelStyles} gap="0">
          <Tooltip content="Zoom in" positioning={{ placement: "left" }}>
            <IconButton
              {...controlButtonStyles}
              aria-label="Zoom in"
              onClick={() => mapStore.zoomIn()}
            >
              <TbPlus />
            </IconButton>
          </Tooltip>

          <Separator borderColor="border.muted" />

          <Tooltip content="Zoom out" positioning={{ placement: "left" }}>
            <IconButton
              {...controlButtonStyles}
              aria-label="Zoom out"
              onClick={() => mapStore.zoomOut()}
            >
              <TbMinus />
            </IconButton>
          </Tooltip>

          <Separator borderColor="border.muted" />

          <Tooltip content="Reset north" positioning={{ placement: "left" }}>
            <IconButton
              {...controlButtonStyles}
              aria-label="Reset to north"
              onClick={() => mapStore.resetNorth()}
            >
              <TbNavigation />
            </IconButton>
          </Tooltip>
        </Flex>

        {/* Globe / flat + fullscreen group */}
        <Flex className="map-controls-view-group" {...panelStyles} gap="0">
          <Tooltip
            content="Toggle globe / flat"
            positioning={{ placement: "left" }}
          >
            <IconButton
              {...controlButtonStyles}
              aria-label="Toggle projection"
              onClick={() => mapStore.toggleProjection()}
            >
              <TbGlobe />
            </IconButton>
          </Tooltip>

          <Separator borderColor="border.muted" />

          <Tooltip content="Fullscreen" positioning={{ placement: "left" }}>
            <IconButton
              {...controlButtonStyles}
              aria-label="Fullscreen"
              onClick={handleFullscreen}
            >
              <TbArrowsMaximize />
            </IconButton>
          </Tooltip>
        </Flex>
      </Flex>
    </Flex>
  );
});

MapControls.displayName = "MapControls";

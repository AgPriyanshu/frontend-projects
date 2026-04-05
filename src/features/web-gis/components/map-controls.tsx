import { Flex, IconButton, Separator, Tooltip } from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import {
  TbArrowsMaximize,
  TbGlobe,
  TbMinus,
  TbNavigation,
  TbPlus,
} from "react-icons/tb";

import { workspaceManager } from "../stores";

interface MapControlsProps {
  workspaceId: string;
}

const controlButtonStyles = {
  size: "sm" as const,
  variant: "ghost" as const,
  color: "text.secondary",
  _hover: { bg: "bg.subtle", color: "text.primary" },
} as const;

const panelStyles = {
  direction: "column" as const,
  p: "0.25rem",
  bg: "bg.panel",
  borderRadius: "xl",
  boxShadow: "md",
  borderWidth: "1px",
  borderColor: "border.subtle",
  backdropFilter: "blur(16px)",
} as const;

export const MapControls = observer(({ workspaceId }: MapControlsProps) => {
  const workspace = workspaceManager.getWorkspace(workspaceId);
  if (!workspace) return null;

  const { mapStore } = workspace;

  const handleFullscreen = () => {
    const el = document.fullscreenElement;
    if (el) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  };

  return (
    <Flex direction="column" gap="0.5rem">
      {/* Zoom + North reset group */}
      <Flex {...panelStyles} gap="0">
        <Tooltip.Root positioning={{ placement: "left" }}>
          <Tooltip.Trigger asChild>
            <IconButton
              {...controlButtonStyles}
              aria-label="Zoom in"
              onClick={() => mapStore.zoomIn()}
            >
              <TbPlus />
            </IconButton>
          </Tooltip.Trigger>
          <Tooltip.Positioner>
            <Tooltip.Content>Zoom in</Tooltip.Content>
          </Tooltip.Positioner>
        </Tooltip.Root>

        <Separator borderColor="border.muted" />

        <Tooltip.Root positioning={{ placement: "left" }}>
          <Tooltip.Trigger asChild>
            <IconButton
              {...controlButtonStyles}
              aria-label="Zoom out"
              onClick={() => mapStore.zoomOut()}
            >
              <TbMinus />
            </IconButton>
          </Tooltip.Trigger>
          <Tooltip.Positioner>
            <Tooltip.Content>Zoom out</Tooltip.Content>
          </Tooltip.Positioner>
        </Tooltip.Root>

        <Separator borderColor="border.muted" />

        <Tooltip.Root positioning={{ placement: "left" }}>
          <Tooltip.Trigger asChild>
            <IconButton
              {...controlButtonStyles}
              aria-label="Reset to north"
              onClick={() => mapStore.resetNorth()}
            >
              <TbNavigation />
            </IconButton>
          </Tooltip.Trigger>
          <Tooltip.Positioner>
            <Tooltip.Content>Reset north</Tooltip.Content>
          </Tooltip.Positioner>
        </Tooltip.Root>
      </Flex>

      {/* Globe / flat + fullscreen group */}
      <Flex {...panelStyles} gap="0">
        <Tooltip.Root positioning={{ placement: "left" }}>
          <Tooltip.Trigger asChild>
            <IconButton
              {...controlButtonStyles}
              aria-label="Toggle projection"
              onClick={() => mapStore.toggleProjection()}
            >
              <TbGlobe />
            </IconButton>
          </Tooltip.Trigger>
          <Tooltip.Positioner>
            <Tooltip.Content>Toggle globe / flat</Tooltip.Content>
          </Tooltip.Positioner>
        </Tooltip.Root>

        <Separator borderColor="border.muted" />

        <Tooltip.Root positioning={{ placement: "left" }}>
          <Tooltip.Trigger asChild>
            <IconButton
              {...controlButtonStyles}
              aria-label="Fullscreen"
              onClick={handleFullscreen}
            >
              <TbArrowsMaximize />
            </IconButton>
          </Tooltip.Trigger>
          <Tooltip.Positioner>
            <Tooltip.Content>Fullscreen</Tooltip.Content>
          </Tooltip.Positioner>
        </Tooltip.Root>
      </Flex>
    </Flex>
  );
});

MapControls.displayName = "MapControls";

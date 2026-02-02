import { Flex, IconButton, Tooltip } from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import {
  FiCircle,
  FiEdit3,
  FiMinus,
  FiMousePointer,
  FiSquare,
  FiTrash2,
} from "react-icons/fi";

import type { DrawMode } from "../domain";
import { workspaceManager, type ToolStore } from "../stores";

interface ToolButtonProps {
  mode: DrawMode;
  icon: React.ReactNode;
  label: string;
  toolStore: ToolStore;
}

const ToolButton = observer(
  ({ mode, icon, label, toolStore }: ToolButtonProps) => {
    const isActive = toolStore.isToolActive(mode);

    return (
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <IconButton
            aria-label={label}
            size="sm"
            variant={isActive ? "solid" : "ghost"}
            bgColor={isActive ? "intent.primary" : undefined}
            color={isActive ? "text.onIntent" : undefined}
            onClick={() => toolStore.toggleTool(mode)}
          >
            {icon}
          </IconButton>
        </Tooltip.Trigger>
        <Tooltip.Positioner>
          <Tooltip.Content>{label}</Tooltip.Content>
        </Tooltip.Positioner>
      </Tooltip.Root>
    );
  }
);

interface ToolbarProps {
  /** Workspace ID this toolbar belongs to. */
  workspaceId: string;
}

/**
 * Toolbar component for draw tools.
 * Allows switching between different drawing modes.
 */
export const Toolbar = observer(({ workspaceId }: ToolbarProps) => {
  const workspace = workspaceManager.getWorkspace(workspaceId);

  if (!workspace) return null;

  const { toolStore, drawStore } = workspace;

  return (
    <Flex
      direction="column"
      gap="0.25rem"
      p="0.5rem"
      bg="bg.panel"
      borderRadius="lg"
      boxShadow="md"
    >
      <ToolButton
        mode="select"
        icon={<FiMousePointer />}
        label="Select"
        toolStore={toolStore}
      />
      <ToolButton
        mode="point"
        icon={<FiCircle size={12} />}
        label="Point"
        toolStore={toolStore}
      />
      <ToolButton
        mode="linestring"
        icon={<FiMinus />}
        label="Line"
        toolStore={toolStore}
      />
      <ToolButton
        mode="polygon"
        icon={<FiSquare />}
        label="Polygon"
        toolStore={toolStore}
      />
      <ToolButton
        mode="freehand"
        icon={<FiEdit3 />}
        label="Freehand"
        toolStore={toolStore}
      />

      {drawStore.hasFeatures && (
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <IconButton
              aria-label="Clear drawings"
              size="sm"
              variant="ghost"
              colorPalette="red"
              onClick={() => drawStore.clearGeometry()}
            >
              <FiTrash2 />
            </IconButton>
          </Tooltip.Trigger>
          <Tooltip.Positioner>
            <Tooltip.Content>Clear all drawings</Tooltip.Content>
          </Tooltip.Positioner>
        </Tooltip.Root>
      )}
    </Flex>
  );
});

Toolbar.displayName = "Toolbar";

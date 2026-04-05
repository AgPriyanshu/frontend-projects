import { Flex, Tooltip } from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { FaMapMarkerAlt } from "react-icons/fa";
import { PiPolygonFill } from "react-icons/pi";
import { TbLine, TbPointer } from "react-icons/tb";
import { DeleteIconButton } from "shared/components";
import { workspaceManager } from "../../stores";
import { ToolButton } from "./tool-button";

interface ToolbarProps {
  workspaceId: string;
}

export const Toolbar = observer(({ workspaceId }: ToolbarProps) => {
  const workspace = workspaceManager.getWorkspace(workspaceId);

  if (!workspace) return null;

  const { toolStore, drawStore } = workspace;

  return (
    <Flex direction="row" gap="0.5rem">
      <Flex
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
          direction="column"
          p="0.25rem"
          bg="bg.panel"
          borderRadius="xl"
          boxShadow="mg"
          borderWidth="1px"
        >
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <DeleteIconButton
                aria-label="Clear drawings"
                onClick={() => drawStore.clearGeometry()}
              />
            </Tooltip.Trigger>
            <Tooltip.Positioner>
              <Tooltip.Content>Clear all drawings</Tooltip.Content>
            </Tooltip.Positioner>
          </Tooltip.Root>
        </Flex>
      )}
    </Flex>
  );
});

Toolbar.displayName = "Toolbar";

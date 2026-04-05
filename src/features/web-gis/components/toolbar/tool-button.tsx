import { IconButton, Tooltip } from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import type { DrawMode } from "../../domain";
import type { ToolStore } from "../../stores";

interface ToolButtonProps {
  mode: DrawMode;
  icon: React.ReactNode;
  label: string;
  toolStore: ToolStore;
}

export const ToolButton = observer(
  ({ mode, icon, label, toolStore }: ToolButtonProps) => {
    const isActive = toolStore.isToolActive(mode);

    return (
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <IconButton
            size={"sm"}
            aria-label={label}
            variant={isActive ? "solid" : "ghost"}
            bgColor={isActive ? "intent.primary" : undefined}
            color={isActive ? "text.onIntent" : "text.secondary"}
            _hover={{
              bgColor: isActive ? "intent.primary" : "bg.subtle",
              color: isActive ? "text.onIntent" : "text.primary",
            }}
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

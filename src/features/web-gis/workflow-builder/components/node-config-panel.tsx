import { Box, Button, Text, VStack } from "@chakra-ui/react";
import type { ProcessingToolDefinition } from "api/web-gis";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { ToolParameterForm } from "shared/components";

import type { CanvasNode } from "../types";

interface NodeConfigPanelProps {
  node: CanvasNode | null;
  tools: ProcessingToolDefinition[];
  datasetOptions: Array<{ id: string; name: string; type: string }>;
  onApplyParams: (nodeId: string, params: Record<string, unknown>) => void;
}

export const NodeConfigPanel = ({
  node,
  tools,
  datasetOptions,
  onApplyParams,
}: NodeConfigPanelProps) => {
  const tool =
    node?.type === "operation"
      ? tools.find((t) => t.toolName === node.data.toolName)
      : undefined;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Record<string, unknown>>({
    defaultValues: node?.type === "operation" ? node.data.params : {},
  });

  useEffect(() => {
    if (node?.type === "operation") {
      reset(node.data.params);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [node?.id]);

  if (!node) {
    return (
      <Box
        className="node-config-panel"
        w="280px"
        borderWidth="1px"
        borderColor="border.default"
        borderRadius="lg"
        p={4}
      >
        <Text fontSize="sm" color="fg.muted">
          Select a node to configure it.
        </Text>
      </Box>
    );
  }

  if (node.type === "source") {
    return (
      <VStack
        className="node-config-panel"
        w="280px"
        h="full"
        borderWidth="1px"
        borderColor="border.default"
        borderRadius="lg"
        p={4}
        align="stretch"
        gap={2}
      >
        <Text fontSize="sm" fontWeight="semibold">
          {node.data.datasetName}
        </Text>
        <Text fontSize="xs" color="fg.muted">
          Data source node. Connect it into an operation to use it as input.
        </Text>
      </VStack>
    );
  }

  if (!tool) {
    return (
      <Box
        className="node-config-panel"
        w="280px"
        borderWidth="1px"
        borderColor="border.default"
        borderRadius="lg"
        p={4}
      >
        <Text fontSize="sm" color="red.500">
          Unknown tool: {node.data.toolName}
        </Text>
      </Box>
    );
  }

  return (
    <VStack
      className="node-config-panel"
      as="form"
      w="280px"
      h="full"
      borderWidth="1px"
      borderColor="border.default"
      borderRadius="lg"
      p={4}
      align="stretch"
      gap={3}
      overflow="auto"
      onSubmit={handleSubmit((values) => onApplyParams(node.id, values))}
    >
      <Text fontSize="sm" fontWeight="semibold">
        {tool.label}
      </Text>
      <Text fontSize="xs" color="fg.muted">
        {tool.description}
      </Text>

      <ToolParameterForm
        parameters={tool.parameters}
        register={register}
        errors={errors as Record<string, { message?: string }>}
        isSubmitting={isSubmitting}
        datasetOptions={datasetOptions}
      />

      <Button type="submit" size="sm" colorPalette="palette.brand">
        Apply
      </Button>
    </VStack>
  );
};

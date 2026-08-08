import { Box, Flex, Spinner, Text } from "@chakra-ui/react";
import { Handle, Position } from "@xyflow/react";
import { TbSettings } from "react-icons/tb";

import { toneTokens } from "design-system/tone";

import { NODE_STATUS_LABEL, NODE_STATUS_TONE } from "../../constants";
import type { OperationNodeData } from "../../types";

interface OperationNodeProps {
  data: OperationNodeData;
  selected: boolean;
}

export const OperationNode = ({ data, selected }: OperationNodeProps) => {
  const { toolLabel, status, errorMessage } = data;
  const statusLabel = NODE_STATUS_LABEL[status];
  const tone = toneTokens[NODE_STATUS_TONE[status]];

  return (
    <Box
      className="workflow-operation-node"
      bg="surface.container"
      borderWidth="2px"
      borderColor={selected ? "border.selected" : tone.border}
      borderRadius="lg"
      p={3}
      w="200px"
      shadow={selected ? "lg" : "sm"}
      cursor="pointer"
      _hover={{ shadow: "md" }}
      transition="box-shadow 0.15s"
    >
      <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />

      <Flex gap={2} align="center">
        <Box as="span" color="object.operation">
          <TbSettings />
        </Box>
        <Text fontSize="sm" fontWeight="semibold" lineClamp={1}>
          {toolLabel}
        </Text>
        {status === "running" && <Spinner size="xs" color="intent.info" />}
      </Flex>

      <Text fontSize="xs" color="text.muted" mt={1}>
        Operation
      </Text>

      {statusLabel && (
        <Box
          mt={2}
          display="inline-block"
          px={2}
          py={0.5}
          borderRadius="full"
          bg={tone.solid}
          color="text.onIntent"
          fontSize="10px"
          fontWeight="bold"
        >
          {statusLabel}
        </Box>
      )}

      {status === "failed" && errorMessage && (
        <Text fontSize="xs" color="text.danger" mt={1} lineClamp={2}>
          {errorMessage}
        </Text>
      )}

      <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />
    </Box>
  );
};

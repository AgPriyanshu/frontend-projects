import { Box, Flex, Text } from "@chakra-ui/react";
import { Handle, Position } from "@xyflow/react";
import { TbMap2, TbVector } from "react-icons/tb";

import { toneTokens } from "design-system/tone";

import { NODE_STATUS_LABEL, NODE_STATUS_TONE } from "../../constants";
import type { SourceNodeData } from "../../types";

interface SourceNodeProps {
  data: SourceNodeData;
  selected: boolean;
}

export const SourceNode = ({ data, selected }: SourceNodeProps) => {
  const { datasetName, datasetType, status, errorMessage } = data;
  const statusLabel = NODE_STATUS_LABEL[status];
  const tone = toneTokens[NODE_STATUS_TONE[status]];

  return (
    <Box
      className="workflow-source-node"
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
      <Flex gap={2} align="center">
        <Box
          as="span"
          color={datasetType === "raster" ? "object.raster" : "object.vector"}
        >
          {datasetType === "raster" ? <TbMap2 /> : <TbVector />}
        </Box>
        <Text fontSize="sm" fontWeight="semibold" lineClamp={1}>
          {datasetName}
        </Text>
      </Flex>

      <Text fontSize="xs" color="text.muted" mt={1}>
        Data source
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

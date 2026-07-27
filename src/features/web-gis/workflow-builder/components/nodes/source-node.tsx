import { Box, Flex, Text } from "@chakra-ui/react";
import { Handle, Position } from "@xyflow/react";
import { TbMap2, TbVector } from "react-icons/tb";

import {
  NODE_STATUS_BADGE_BG,
  NODE_STATUS_BORDER,
  NODE_STATUS_LABEL,
} from "../../constants";
import type { SourceNodeData } from "../../types";

interface SourceNodeProps {
  data: SourceNodeData;
  selected: boolean;
}

export const SourceNode = ({ data, selected }: SourceNodeProps) => {
  const { datasetName, datasetType, status, errorMessage } = data;
  const statusLabel = NODE_STATUS_LABEL[status];

  return (
    <Box
      className="workflow-source-node"
      bg="surface.container"
      borderWidth="2px"
      borderColor={selected ? "blue.500" : NODE_STATUS_BORDER[status]}
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
          color={datasetType === "raster" ? "green.400" : "object.file"}
        >
          {datasetType === "raster" ? <TbMap2 /> : <TbVector />}
        </Box>
        <Text fontSize="sm" fontWeight="semibold" lineClamp={1}>
          {datasetName}
        </Text>
      </Flex>

      <Text fontSize="xs" color="fg.muted" mt={1}>
        Data source
      </Text>

      {statusLabel && (
        <Box
          mt={2}
          display="inline-block"
          px={2}
          py={0.5}
          borderRadius="full"
          bg={NODE_STATUS_BADGE_BG[status]}
          color="white"
          fontSize="10px"
          fontWeight="bold"
        >
          {statusLabel}
        </Box>
      )}

      {status === "failed" && errorMessage && (
        <Text fontSize="xs" color="red.500" mt={1} lineClamp={2}>
          {errorMessage}
        </Text>
      )}

      <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />
    </Box>
  );
};

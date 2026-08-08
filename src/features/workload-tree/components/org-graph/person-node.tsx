import { Box, Flex, Text } from "@chakra-ui/react";
import { Handle, Position } from "@xyflow/react";
import type { LoadStatus } from "api/workload/types";
import { toneTokens, type Tone } from "design-system/tone";

interface PersonNodeData {
  name: string;
  designation: string;
  loadStatus: LoadStatus;
  loadRatio: number;
  activeTaskCount: number;
  capacity: number;
}

const STATUS_TONE: Record<LoadStatus, Tone> = {
  UNDER: "warning",
  HEALTHY: "success",
  OVER: "danger",
};

const STATUS_LABEL: Record<LoadStatus, string> = {
  UNDER: "Under",
  HEALTHY: "Healthy",
  OVER: "Overloaded",
};

const getInitials = (name: string): string => {
  return name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
};

interface PersonNodeProps {
  data: PersonNodeData;
  selected: boolean;
}

export const PersonNode = ({ data, selected }: PersonNodeProps) => {
  const { name, designation, loadStatus, activeTaskCount, capacity } = data;
  const tone = toneTokens[STATUS_TONE[loadStatus]];

  return (
    <Box
      className="person-node"
      bg={tone.subtle}
      borderWidth="2px"
      borderColor={selected ? "border.selected" : tone.border}
      borderRadius="xl"
      p={3}
      w="220px"
      shadow={selected ? "lg" : "md"}
      cursor="pointer"
      _hover={{ shadow: "lg" }}
      transition="box-shadow 0.15s"
    >
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />

      <Flex gap={3} align="center">
        <Flex
          w="40px"
          h="40px"
          borderRadius="full"
          bg={tone.solid}
          color="text.onIntent"
          align="center"
          justify="center"
          fontWeight="bold"
          fontSize="sm"
          flexShrink={0}
        >
          {getInitials(name)}
        </Flex>

        <Box overflow="hidden">
          <Text
            fontWeight="semibold"
            fontSize="sm"
            lineClamp={1}
            color="text.primary"
          >
            {name}
          </Text>
          <Text fontSize="xs" color="text.muted" lineClamp={1}>
            {designation}
          </Text>
        </Box>
      </Flex>

      <Flex mt={2} justify="space-between" align="center">
        <Box
          px={2}
          py={0.5}
          borderRadius="full"
          bg={tone.solid}
          color="text.onIntent"
          fontSize="10px"
          fontWeight="bold"
        >
          {STATUS_LABEL[loadStatus]}
        </Box>
        <Text fontSize="xs" color="text.muted">
          {activeTaskCount} / {capacity} tasks
        </Text>
      </Flex>

      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
    </Box>
  );
};

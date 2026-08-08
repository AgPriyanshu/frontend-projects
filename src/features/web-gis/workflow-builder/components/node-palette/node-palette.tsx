import { Box, Flex, Text, VStack } from "@chakra-ui/react";
import {
  useDatasetsNodes,
  useProcessingTools,
  type DatasetNodeResponse,
} from "api/web-gis";
import { useMemo } from "react";
import { TbMap2, TbSettings, TbVector } from "react-icons/tb";

import type { PalettePayload } from "../../types";
import { WORKFLOW_NODE_DRAG_TYPE } from "../../types";

const flattenDatasets = (nodes: DatasetNodeResponse[]): DatasetNodeResponse[] =>
  nodes.flatMap((node) =>
    node.dataset ? [node] : flattenDatasets(node.children)
  );

const startDrag = (event: React.DragEvent, payload: PalettePayload) => {
  // "text/plain" is used because custom MIME types are not readable during
  // dragover in every browser, which the canvas needs to accept the drop.
  event.dataTransfer.setData(WORKFLOW_NODE_DRAG_TYPE, JSON.stringify(payload));
  event.dataTransfer.effectAllowed = "copy";
};

const PaletteItem = ({
  icon,
  label,
  onDragStart,
}: {
  icon: React.ReactNode;
  label: string;
  onDragStart: (event: React.DragEvent) => void;
}) => (
  // The draggable attribute is set on a native element so it cannot be
  // filtered out by the styled-system prop forwarding.
  <div draggable onDragStart={onDragStart} style={{ cursor: "grab" }}>
    <Flex
      className="node-palette-item"
      align="center"
      gap={2}
      px={2}
      py={1.5}
      borderRadius="md"
      _hover={{ bgColor: "surface.hover" }}
    >
      <Box as="span" fontSize="sm" color="text.muted">
        {icon}
      </Box>
      <Text fontSize="sm" lineClamp={1}>
        {label}
      </Text>
    </Flex>
  </div>
);

export const NodePalette = () => {
  const { data: datasetNodes } = useDatasetsNodes();
  const { data: toolsResponse } = useProcessingTools();

  const datasets = useMemo(
    () => (datasetNodes ? flattenDatasets(datasetNodes.data) : []),
    [datasetNodes]
  );

  const tools = toolsResponse?.data.tools ?? [];

  return (
    <VStack
      className="node-palette"
      w="240px"
      h="full"
      borderWidth="1px"
      borderColor="border.default"
      borderRadius="lg"
      align="stretch"
      gap={0}
      overflow="hidden"
    >
      <Box
        borderBottomWidth="1px"
        borderColor="border.default"
        px={3}
        py={2}
        flex={1}
        minH={0}
        overflow="auto"
      >
        <Text fontSize="xs" fontWeight="semibold" color="text.muted" mb={1}>
          Data Sources
        </Text>
        {datasets.length === 0 && (
          <Text fontSize="xs" color="text.muted">
            No datasets uploaded yet.
          </Text>
        )}
        {datasets.map((node) => (
          <PaletteItem
            key={node.id}
            icon={node.dataset?.type === "raster" ? <TbMap2 /> : <TbVector />}
            label={node.dataset?.fileName ?? node.name}
            onDragStart={(event) =>
              startDrag(event, {
                kind: "source",
                datasetId: node.dataset!.id,
                datasetName: node.dataset?.fileName ?? node.name,
                datasetType: node.dataset?.type,
              })
            }
          />
        ))}
      </Box>

      <Box px={3} py={2} flex={1} minH={0} overflow="auto">
        <Text fontSize="xs" fontWeight="semibold" color="text.muted" mb={1}>
          Operations
        </Text>
        {tools.map((tool) => (
          <PaletteItem
            key={tool.toolName}
            icon={<TbSettings />}
            label={tool.label}
            onDragStart={(event) =>
              startDrag(event, {
                kind: "operation",
                toolName: tool.toolName,
                toolLabel: tool.label,
              })
            }
          />
        ))}
      </Box>
    </VStack>
  );
};

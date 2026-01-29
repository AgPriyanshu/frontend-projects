import { Box, Text } from "@chakra-ui/react";
import { useDatasets } from "api/web-gis";
import { Tree } from "react-arborist";
import useResizeObserver from "use-resize-observer";
import { DatasetTreeNode } from "./dataset-tree-node";

export const DatasetTree = () => {
  // Hooks.
  const { ref, height, width } = useResizeObserver();

  // APIs.
  const { data, isLoading } = useDatasets();

  if (isLoading || !data) {
    return (
      <Box ref={ref} h="full" w="full">
        <Text fontSize="sm" color="text.primary" p={2}>
          Loading datasets...
        </Text>
      </Box>
    );
  }

  // Handlers.
  const disableDropForSameFolder = (args: {
    dragNodes: any;
    parentNode: any;
  }) => {
    const { dragNodes, parentNode } = args;
    const draggedNode = dragNodes[0];
    const draggedNodeParent = draggedNode?.parent;
    return draggedNodeParent?.id === parentNode?.id;
  };

  return (
    <Box ref={ref} h="full" w="full">
      <Tree
        data={data.data}
        openByDefault={true}
        indent={20}
        overscanCount={5}
        disableDrop={disableDropForSameFolder}
        height={height}
        width={width}
      >
        {DatasetTreeNode}
      </Tree>
    </Box>
  );
};

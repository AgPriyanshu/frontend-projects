import { Box, Button, Flex, Text } from "@chakra-ui/react";
import { useDatasets } from "api/web-gis";
import { useState } from "react";
import { Tree } from "react-arborist";
import useResizeObserver from "use-resize-observer";

import { DatasetTreeNode } from "./dataset-tree-node";
import { DatasetUploadModal } from "./dataset-upload-modal";

export const DatasetTree = () => {
  // States.
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadParentId, setUploadParentId] = useState<string | null>(null);

  // Hooks.
  const { ref, height = 0, width = 0 } = useResizeObserver();

  // APIs.
  const { data, isLoading } = useDatasets();

  // Handlers.
  const disableDropForSameFolder = (args: {
    dragNodes: Array<{ parent?: { id?: string | null } | null }>;
    parentNode?: { id?: string | null } | null;
  }) => {
    const { dragNodes, parentNode } = args;
    const draggedNode = dragNodes[0];
    const draggedNodeParent = draggedNode?.parent;

    return draggedNodeParent?.id === parentNode?.id;
  };

  const handleOpenUpload = (parentId: string | null = null) => {
    setUploadParentId(parentId);
    setIsUploadModalOpen(true);
  };

  // Render.
  return (
    <>
      <Flex direction="column" h="full" w="full">
        <Box flex={1} w="full" ref={ref}>
          {isLoading || !data ? (
            <Text fontSize="sm" color="text.primary" p={2}>
              Loading datasets...
            </Text>
          ) : data.data.length === 0 ? (
            <Flex
              direction="column"
              align="center"
              justify="center"
              h="full"
              p={4}
            >
              <Text fontSize="sm" color="text.secondary" mb={4}>
                No datasets found
              </Text>
              <Button
                size="sm"
                colorScheme="blue"
                onClick={() => handleOpenUpload(null)}
              >
                Upload Dataset
              </Button>
            </Flex>
          ) : (
            <Tree
              data={data.data}
              openByDefault={true}
              indent={15}
              disableDrop={disableDropForSameFolder}
              height={height}
              width={width}
            >
              {(props) => (
                <DatasetTreeNode
                  {...props}
                  onUpload={() => handleOpenUpload(props.node.data.id)}
                />
              )}
            </Tree>
          )}
        </Box>
      </Flex>

      <DatasetUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false);
          setUploadParentId(null);
        }}
        parentId={uploadParentId}
      />
    </>
  );
};

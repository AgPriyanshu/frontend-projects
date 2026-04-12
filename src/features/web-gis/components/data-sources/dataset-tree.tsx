import { Box, Button, Flex, HStack, IconButton, Text } from "@chakra-ui/react";
import { useDatasetsNodes } from "api/web-gis";
import { useState } from "react";
import { Tree } from "react-arborist";
import { FaFolderPlus } from "react-icons/fa";
import useResizeObserver from "use-resize-observer";

import { AiOutlineFileAdd } from "react-icons/ai";
import { CreateFolderModal } from "./create-folder-modal";
import { DatasetTreeNode } from "./dataset-tree-node";
import { DatasetUploadModal } from "./dataset-upload-modal";

export const DatasetTree = () => {
  // States.
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadParentId, setUploadParentId] = useState<string | null>(null);
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [folderParentId, setFolderParentId] = useState<string | null>(null);

  // Hooks.
  const { ref, height = 0, width = 0 } = useResizeObserver();

  // APIs.
  const { data, isLoading } = useDatasetsNodes();

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

  const handleOpenCreateFolder = (parentId: string | null = null) => {
    setFolderParentId(parentId);
    setIsCreateFolderModalOpen(true);
  };

  // Render.
  return (
    <Box
      className="dataset-tree-container"
      w={"full"}
      flex={0.5}
      borderColor={"border.default"}
      borderWidth={"1px"}
      borderRadius={"lg"}
      py={"0.5rem"}
      pt={"0"}
      overflow={"hidden"}
    >
      <Flex className="dataset-tree" direction="column" h="full" w="full">
        {/* Top Action Bar */}
        <Flex
          className="dataset-tree-header"
          justify="space-between"
          align="center"
          p={2}
          borderBottom="1px solid"
          borderColor="border.subtle"
          bg="bg.panel"
        >
          <Text
            className="dataset-tree-title"
            fontSize="sm"
            fontWeight="semibold"
            color="text.primary"
            ml={"1rem"}
          >
            Datasets
          </Text>
          <HStack className="dataset-tree-actions" gap={1}>
            <IconButton
              size="sm"
              variant="ghost"
              aria-label="New folder"
              onClick={() => handleOpenCreateFolder(null)}
            >
              <FaFolderPlus />
            </IconButton>
            <IconButton
              size="sm"
              variant="ghost"
              aria-label="Upload dataset"
              onClick={() => handleOpenUpload(null)}
            >
              <AiOutlineFileAdd />
            </IconButton>
          </HStack>
        </Flex>

        <Box
          className="dataset-tree-body"
          flex={1}
          w="full"
          ref={ref}
          position="relative"
        >
          {isLoading || !data ? (
            <Text fontSize="sm" color="text.primary" p={2}>
              Loading datasets...
            </Text>
          ) : data.data.length === 0 ? (
            <Flex
              className="dataset-tree-empty-state"
              direction="column"
              align="center"
              justify="center"
              h="full"
              p={4}
              gap={3}
            >
              <Text fontSize="sm" color="text.secondary">
                No datasets found
              </Text>
              <HStack>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleOpenCreateFolder(null)}
                >
                  New Folder
                </Button>
                <Button
                  size="sm"
                  colorPalette="palette.brand"
                  color="white"
                  bgColor="intent.primary"
                  onClick={() => handleOpenUpload(null)}
                >
                  Upload Dataset
                </Button>
              </HStack>
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

      <CreateFolderModal
        isOpen={isCreateFolderModalOpen}
        onClose={() => {
          setIsCreateFolderModalOpen(false);
          setFolderParentId(null);
        }}
        parentId={folderParentId}
      />
    </Box>
  );
};

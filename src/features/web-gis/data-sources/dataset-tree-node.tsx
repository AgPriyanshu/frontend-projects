import { Box, Flex, Text } from "@chakra-ui/react";
import { queryClient } from "api/query-client";
import { QueryKeys } from "api/query-keys";
import { useUploadDatasets } from "api/web-gis";
import { useEffect, useState } from "react";
import type { NodeRendererProps } from "react-arborist";
import { AiOutlineFileAdd } from "react-icons/ai";
import { FaFolder, FaFolderOpen } from "react-icons/fa";
import { TbVector } from "react-icons/tb";
import { InlineFileUploader } from "shared/components";
import { type DatasetNode, DatasetNodeType } from "../types";
export const DatasetTreeNode = ({
  node,
  style,
  dragHandle,
}: NodeRendererProps<DatasetNode>) => {
  // States.
  const [isHovered, setIsHovered] = useState(false);

  // Variables.
  const isFolder = node.data.type === DatasetNodeType.FOLDER;

  // APIs.
  const { mutate: uploadDatasetNode } = useUploadDatasets();

  // Handlers.
  const handleFileSelect = (files: FileList) => {
    console.log("Files selected for folder:", node.data.name, files);
    uploadDatasetNode(
      {
        name: node.data.name,
        type: DatasetNodeType.DATASET,
        parent: node.data.id,
        files: Array.from(files),
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: QueryKeys.datasets,
          });
        },
      }
    );
  };

  // Add dataset ID to drag data when dragging starts (for map drop)
  useEffect(() => {
    const element = document.querySelector(
      `[data-node-id="${node.id}"]`
    ) as HTMLElement;
    if (!element) return;

    const handleDragStart = (e: DragEvent) => {
      if (!isFolder && node.data.dataset) {
        console.log(node.data.id, node.data.dataset.id);
        e.dataTransfer?.setData("application/dataset-id", node.data.id);
      }
    };

    element.addEventListener("dragstart", handleDragStart);

    return () => {
      element.removeEventListener("dragstart", handleDragStart);
    };
  }, [node.id, isFolder, node.data.dataset]);

  return (
    <Flex
      ref={dragHandle}
      data-node-id={node.id}
      onClick={(e) => {
        e.stopPropagation();
        node.toggle();
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      // Styles
      align="center"
      justify="space-between"
      style={{ ...style, alignItems: "center" }}
      cursor="pointer"
      bg={node.isSelected ? "intent.primary" : "initial"}
      _hover={{ bg: node.isSelected ? "intent.primaryHover" : "surface.hover" }}
      _active={{ bg: "intent.primaryActive" }}
      transition="background 0.2s"
      position="relative"
    >
      <Flex align="center" flex={1}>
        {!isFolder ? (
          <Box as="span" mx={2} color={"object.file"} fontSize="sm">
            <TbVector />
          </Box>
        ) : node.isOpen ? (
          <Box as="span" mx={2} color={"object.folder"} fontSize="sm">
            <FaFolderOpen />
          </Box>
        ) : (
          <Box as="span" mx={2} color={"object.folder"} fontSize="sm">
            <FaFolder />
          </Box>
        )}
        <Text fontSize="sm" color={"text.primary"} userSelect="none">
          {isFolder ? node.data.name : node.data.dataset?.fileName}
        </Text>
      </Flex>

      {isFolder && (
        <Box
          opacity={isHovered ? 1 : 0}
          transition="opacity 0.2s"
          mr={"0.5rem"}
          onClick={(e) => e.stopPropagation()}
        >
          <InlineFileUploader
            onFileSelect={handleFileSelect}
            icon={<AiOutlineFileAdd />}
            ariaLabel={`Upload file to ${node.data.name}`}
            multiple
          />
        </Box>
      )}
    </Flex>
  );
};

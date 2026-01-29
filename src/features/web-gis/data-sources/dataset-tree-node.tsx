import { useState, useEffect } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import type { NodeRendererProps } from "react-arborist";
import { FaFile, FaFolderOpen, FaFolder, FaPlus } from "react-icons/fa";
import { type DatasetNode, DatasetNodeType } from "../types";
import { InlineFileUploader } from "shared/components";
import { useUploadDatasets } from "api/web-gis";
import { queryClient } from "api/query-client";
import { QueryKeys } from "api/query-keys";

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
      align="center"
      justify="space-between"
      style={style}
      py={"0.25rem"}
      cursor="pointer"
      borderRadius="md"
      onClick={(e) => {
        e.stopPropagation();
        node.toggle();
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      bg={node.isSelected ? "surface.subtle" : "transparent"}
      _hover={{ bg: "intent.primaryHover" }}
      transition="background 0.2s"
      position="relative"
    >
      <Flex align="center" flex={1}>
        <Box as="span" mx={2} color={"text.primary"} fontSize="sm">
          {!isFolder ? (
            <FaFile />
          ) : node.isOpen ? (
            <FaFolderOpen />
          ) : (
            <FaFolder />
          )}
        </Box>
        <Text fontSize="sm" color={"text.primary"} userSelect="none">
          {isFolder ? node.data.name : node.data.dataset?.fileName}
        </Text>
      </Flex>

      {isFolder && (
        <Box
          opacity={isHovered ? 1 : 0}
          transition="opacity 0.2s"
          mr={2}
          onClick={(e) => e.stopPropagation()}
        >
          <InlineFileUploader
            onFileSelect={handleFileSelect}
            icon={<FaPlus />}
            ariaLabel={`Upload file to ${node.data.name}`}
            multiple
          />
        </Box>
      )}
    </Flex>
  );
};

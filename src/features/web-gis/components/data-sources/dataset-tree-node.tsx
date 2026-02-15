import { Box, Flex, Text } from "@chakra-ui/react";
import { queryClient } from "api/query-client";
import { QueryKeys } from "api/query-keys";
import { useUploadDatasets } from "api/web-gis";
import { useState } from "react";
import type { NodeRendererProps } from "react-arborist";
import { AiOutlineFileAdd } from "react-icons/ai";
import { FaFolder, FaFolderOpen } from "react-icons/fa";
import { TbVector } from "react-icons/tb";
import { InlineFileUploader } from "shared/components";
import { type DatasetNode, DatasetNodeType } from "../../types";

export const DatasetTreeNode = ({
  node,
  style,
  dragHandle,
}: NodeRendererProps<DatasetNode>) => {
  // States.
  const [isHovered, setIsHovered] = useState(false);

  // Variables.
  const isFolder = node.data.type === DatasetNodeType.FOLDER;
  const dataset = node.data.dataset;

  // APIs.
  const { mutate: uploadDatasetNode } = useUploadDatasets();

  // Handlers.
  const handleFileSelect = (files: FileList) => {
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

  const handleDragStart = (e: React.DragEvent) => {
    if (isFolder || !dataset) return;

    e.dataTransfer.setData("application/dataset-id", dataset.id);
    e.dataTransfer.setData(
      "application/dataset-name",
      dataset.fileName || node.data.name
    );
    e.dataTransfer.effectAllowed = "copy";
  };

  // Renders.
  const renderFolderIcon = (isOpen: boolean) => {
    return isOpen ? (
      <Box as="span" mx={2} color={"object.folder"} fontSize="sm">
        <FaFolderOpen />
      </Box>
    ) : (
      <Box as="span" mx={2} color={"object.folder"} fontSize="sm">
        <FaFolder />
      </Box>
    );
  };

  return (
    <Flex
      ref={dragHandle}
      draggable={!isFolder && !!dataset}
      onDragStart={handleDragStart}
      data-node-id={node.id}
      onClick={(e) => {
        e.stopPropagation();
        node.toggle();
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ ...style, alignItems: "center" }}
      align="center"
      justify="space-between"
      cursor="pointer"
      bgColor={node.isSelected ? "intent.primary" : "initial"}
      transition="background 0.2s"
      position="relative"
      _hover={{
        bgColor: node.isSelected ? "intent.primaryHover" : "surface.hover",
      }}
      _active={{ bgColor: "intent.primaryActive" }}
    >
      <Flex align="center" flex={1}>
        {isFolder ? (
          renderFolderIcon(node.isOpen)
        ) : (
          <Box as="span" mx={2} color={"object.file"} fontSize="sm">
            <TbVector />
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

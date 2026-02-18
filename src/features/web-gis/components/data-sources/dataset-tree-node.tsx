import { Box, Flex, IconButton, Text } from "@chakra-ui/react";
import { useDeleteDatasetNode } from "api/web-gis";
import { useState } from "react";
import type { NodeRendererProps } from "react-arborist";
import { AiOutlineFileAdd } from "react-icons/ai";
import { FaFolder, FaFolderOpen } from "react-icons/fa";
import { FiTrash2 } from "react-icons/fi";
import { TbMap2, TbVector } from "react-icons/tb";
import { type DatasetNode, DatasetNodeType } from "../../types";

interface DatasetTreeNodeProps extends NodeRendererProps<DatasetNode> {
  onUpload?: () => void;
}

export const DatasetTreeNode = ({
  node,
  style,
  dragHandle,
  onUpload,
}: DatasetTreeNodeProps) => {
  // States.
  const [isHovered, setIsHovered] = useState(false);

  // APIs.
  const { mutate: deleteNode, isPending: isDeleting } = useDeleteDatasetNode();

  // Variables.
  const isFolder = node.data.type === DatasetNodeType.FOLDER;
  const dataset = node.data.dataset;

  // Handlers.
  const handleDragStart = (e: React.DragEvent) => {
    if (isFolder || !dataset) return;

    e.dataTransfer.setData("application/dataset-id", dataset.id);
    e.dataTransfer.setData(
      "application/dataset-name",
      dataset.fileName || node.data.name
    );
    e.dataTransfer.setData("application/dataset-type", dataset.type ?? "");
    e.dataTransfer.effectAllowed = "copy";
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete "${node.data.name}"?`)) {
      deleteNode(node.data.id);
    }
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
        ) : dataset?.type === "raster" ? (
          <Box as="span" mx={2} color={"green.400"} fontSize="sm">
            <TbMap2 />
          </Box>
        ) : (
          <Box as="span" mx={2} color={"object.file"} fontSize="sm">
            <TbVector />
          </Box>
        )}

        <Text fontSize="sm" color={"text.primary"} userSelect="none">
          {isFolder ? node.data.name : node.data.dataset?.fileName}
        </Text>
      </Flex>

      {/* Actions: Upload & Delete */}
      <Flex
        align="center"
        gap="0.25rem"
        opacity={isHovered ? 1 : 0}
        transition="opacity 0.2s"
        mr={"0.5rem"}
        onClick={(e) => e.stopPropagation()}
      >
        {isFolder && (
          <IconButton
            size="xs"
            variant="ghost"
            aria-label={`Upload file to ${node.data.name}`}
            onClick={(e) => {
              e.stopPropagation();
              onUpload?.();
            }}
          >
            <AiOutlineFileAdd />
          </IconButton>
        )}

        <IconButton
          size="xs"
          variant="ghost"
          colorPalette="red"
          aria-label={`Delete ${node.data.name}`}
          onClick={(e) => handleDelete(e)}
          loading={isDeleting}
        >
          <FiTrash2 />
        </IconButton>
      </Flex>
    </Flex>
  );
};

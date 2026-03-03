import { Box, Flex, IconButton, Text } from "@chakra-ui/react";
import { DATASET_TYPES, useDeleteDatasetNode } from "api/web-gis";
import { useState } from "react";
import type { NodeRendererProps } from "react-arborist";
import { AiOutlineFileAdd } from "react-icons/ai";
import { FaFolder, FaFolderOpen } from "react-icons/fa";
import { TbMap2, TbVector } from "react-icons/tb";
import { DeleteIconButton } from "shared/components";
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
  const handleDragStart = (dragStartEvent: React.DragEvent) => {
    if (isFolder || !dataset) {
      return;
    }

    dragStartEvent.dataTransfer.setData("application/dataset-id", dataset.id);
    dragStartEvent.dataTransfer.setData(
      "application/dataset-name",
      dataset.fileName || node.data.name
    );
    dragStartEvent.dataTransfer.setData(
      "application/dataset-type",
      dataset.type ?? ""
    );
    dragStartEvent.dataTransfer.effectAllowed = "copy";
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
        ) : dataset?.type === DATASET_TYPES.RASTER ? (
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
            variant="plain"
            aria-label={`Upload file to ${node.data.name}`}
            onClick={(e) => {
              e.stopPropagation();
              onUpload?.();
            }}
            _hover={{ scale: 1.1, transition: "0.2s" }}
          >
            <AiOutlineFileAdd />
          </IconButton>
        )}
        <DeleteIconButton onClick={handleDelete} loading={isDeleting} />
      </Flex>
    </Flex>
  );
};

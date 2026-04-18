import { Box, Flex, IconButton, Text } from "@chakra-ui/react";
import { DatasetType, useDeleteDatasetNode } from "api/web-gis";
import { ConfirmDialog } from "design-system/confirm-dialog";
import { useState } from "react";
import type { NodeRendererProps } from "react-arborist";
import { AiOutlineFileAdd } from "react-icons/ai";
import { FaFolder, FaFolderOpen } from "react-icons/fa";
import { TbMap2, TbVector } from "react-icons/tb";
import { DeleteIconButton } from "shared/components";
import { type DatasetNode, DatasetNodeType } from "../../types";

interface DatasetTreeNodeProps extends NodeRendererProps<DatasetNode> {
  onUpload?: () => void;
  selectedIds: Set<string>;
  onToggleSelect: (id: string, shiftKey: boolean) => void;
}

export const DatasetTreeNode = ({
  node,
  style,
  dragHandle,
  onUpload,
  selectedIds,
  onToggleSelect,
}: DatasetTreeNodeProps) => {
  // States.
  const [isHovered, setIsHovered] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // APIs.
  const { mutate: deleteNode, isPending: isDeleting } = useDeleteDatasetNode();

  // Variables.
  const isFolder = node.data.type === DatasetNodeType.FOLDER;
  const dataset = node.data.dataset;
  const isChecked = selectedIds.has(node.data.id);

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
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    deleteNode(node.data.id);
    setIsConfirmOpen(false);
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
    <>
      <Flex
        className="dataset-tree-node"
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
        bgColor={isChecked ? "surface.subtle" : "initial"}
        borderLeftWidth="2px"
        borderLeftColor={isChecked ? "intent.primary" : "transparent"}
        transition="background 0.2s, border-color 0.2s"
        position="relative"
        _hover={{
          bgColor: "surface.hover",
        }}
        _active={{ bgColor: "surface.subtle" }}
      >
        <Flex className="dataset-tree-node-content" align="center" flex={1}>
          <Box
            as="span"
            w="14px"
            minW="14px"
            h="14px"
            borderWidth="1.5px"
            borderColor={isChecked ? "intent.primary" : "border.default"}
            borderRadius="3px"
            bg={isChecked ? "intent.primary" : "transparent"}
            display="flex"
            alignItems="center"
            justifyContent="center"
            ml={1}
            flexShrink={0}
            cursor="pointer"
            opacity={isChecked || isHovered ? 1 : 0}
            transition="opacity 0.15s"
            onClick={(e) => {
              e.stopPropagation();
              onToggleSelect(node.data.id, e.shiftKey);
            }}
            _hover={{ borderColor: "intent.primary" }}
          >
            {isChecked && (
              <Box
                as="span"
                color="white"
                lineHeight={1}
                fontSize="10px"
                fontWeight="bold"
              >
                ✓
              </Box>
            )}
          </Box>
          {isFolder ? (
            renderFolderIcon(node.isOpen)
          ) : dataset?.type === DatasetType.RASTER ? (
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
          className="dataset-tree-node-actions"
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
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title={`Delete "${node.data.name}"?`}
        description="This action cannot be undone."
        confirmLabel="Delete"
        isLoading={isDeleting}
      />
    </>
  );
};

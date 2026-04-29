import {
  Box,
  HStack,
  IconButton,
  Image,
  MenuContent,
  MenuItem,
  MenuRoot,
  MenuTrigger,
  Table,
  Text,
  VStack,
} from "@chakra-ui/react";
import { FiMoreVertical, FiEdit2, FiRefreshCw, FiTrash2 } from "react-icons/fi";
import { useState } from "react";
import { ConfirmDialog } from "design-system/confirm-dialog";
import { toaster } from "design-system/toaster/toaster-instance";
import type { DsItem } from "api/dead-stock";
import { useRefreshItem, useDeleteItem } from "api/dead-stock";
import { StatusBadge } from "./_status-badge";

interface ItemRowProps {
  item: DsItem;
  onEdit: (item: DsItem) => void;
  isMobile?: boolean;
}

interface ItemActionsProps {
  item: DsItem;
  onEdit: (item: DsItem) => void;
  onRefresh: () => void;
  onDelete: () => void;
  isDeleteOpen: boolean;
  setIsDeleteOpen: (isOpen: boolean) => void;
  isDeleting: boolean;
}

const ItemActions = ({
  item,
  onEdit,
  onRefresh,
  onDelete,
  isDeleteOpen,
  setIsDeleteOpen,
  isDeleting,
}: ItemActionsProps) => (
  <>
    <MenuRoot>
      <MenuTrigger asChild>
        <IconButton variant="ghost" size="sm" aria-label="Item actions">
          <FiMoreVertical />
        </IconButton>
      </MenuTrigger>
      <MenuContent>
        <MenuItem value="edit" onClick={() => onEdit(item)}>
          <HStack gap={2}>
            <FiEdit2 /> <Text>Edit</Text>
          </HStack>
        </MenuItem>
        <MenuItem value="refresh" onClick={onRefresh}>
          <HStack gap={2}>
            <FiRefreshCw /> <Text>Refresh</Text>
          </HStack>
        </MenuItem>
        <MenuItem
          value="delete"
          onClick={() => setIsDeleteOpen(true)}
          color="intent.danger"
        >
          <HStack gap={2}>
            <FiTrash2 /> <Text>Delete</Text>
          </HStack>
        </MenuItem>
      </MenuContent>
    </MenuRoot>

    <ConfirmDialog
      isOpen={isDeleteOpen}
      onClose={() => setIsDeleteOpen(false)}
      onConfirm={onDelete}
      title="Delete Item"
      description={`Are you sure you want to delete "${item.name}"? This cannot be undone.`}
      isLoading={isDeleting}
    />
  </>
);

export const ItemRow = ({ item, onEdit, isMobile }: ItemRowProps) => {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const refreshItem = useRefreshItem();
  const deleteItem = useDeleteItem();

  const handleRefresh = async () => {
    try {
      await refreshItem.mutateAsync(item.id);
      toaster.success({
        title: "Item refreshed",
        description: "Stock confirmed — visible for 30 more days.",
      });
    } catch {
      toaster.error({ title: "Failed to refresh item" });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteItem.mutateAsync(item.id);
      toaster.success({ title: "Item deleted" });
      setIsDeleteOpen(false);
    } catch {
      toaster.error({ title: "Failed to delete item" });
    }
  };

  const primaryImage =
    item.images.find((img) => img.isPrimary)?.thumbUrl ||
    item.images[0]?.thumbUrl;

  if (isMobile) {
    return (
      <Box
        p={4}
        borderWidth="1px"
        borderColor="border.default"
        borderRadius="lg"
        bg="bg.panel"
        w="full"
      >
        <HStack gap={4} align="start" justify="space-between">
          <HStack gap={4} align="start">
            <Box
              boxSize="60px"
              borderRadius="md"
              overflow="hidden"
              bg="bg.muted"
            >
              {primaryImage ? (
                <Image
                  src={primaryImage}
                  alt={item.name}
                  w="full"
                  h="full"
                  objectFit="cover"
                />
              ) : (
                <Box w="full" h="full" bg="surface.subtle" />
              )}
            </Box>
            <VStack align="start" gap={1}>
              <Text fontWeight="medium" lineClamp={1}>
                {item.name}
              </Text>
              <Text fontSize="sm" color="text.secondary">
                Qty: {item.quantity} •{" "}
                {item.price ? `₹${item.price}` : "No price"}
              </Text>
              <StatusBadge item={item} />
            </VStack>
          </HStack>
          <ItemActions
            item={item}
            onEdit={onEdit}
            onRefresh={handleRefresh}
            onDelete={handleDelete}
            isDeleteOpen={isDeleteOpen}
            setIsDeleteOpen={setIsDeleteOpen}
            isDeleting={deleteItem.isPending}
          />
        </HStack>
      </Box>
    );
  }

  return (
    <Table.Row>
      <Table.Cell>
        <HStack gap={3}>
          <Box boxSize="40px" borderRadius="sm" overflow="hidden" bg="bg.muted">
            {primaryImage ? (
              <Image
                src={primaryImage}
                alt={item.name}
                w="full"
                h="full"
                objectFit="cover"
              />
            ) : (
              <Box w="full" h="full" bg="surface.subtle" />
            )}
          </Box>
          <Text fontWeight="medium" lineClamp={1}>
            {item.name}
          </Text>
        </HStack>
      </Table.Cell>
      <Table.Cell>{item.quantity}</Table.Cell>
      <Table.Cell>{item.price ? `₹${item.price}` : "-"}</Table.Cell>
      <Table.Cell>
        <StatusBadge item={item} />
      </Table.Cell>
      <Table.Cell textAlign="right">
        <ItemActions
          item={item}
          onEdit={onEdit}
          onRefresh={handleRefresh}
          onDelete={handleDelete}
          isDeleteOpen={isDeleteOpen}
          setIsDeleteOpen={setIsDeleteOpen}
          isDeleting={deleteItem.isPending}
        />
      </Table.Cell>
    </Table.Row>
  );
};

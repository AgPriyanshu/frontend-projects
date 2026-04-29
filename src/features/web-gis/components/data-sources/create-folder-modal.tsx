import { Button, Dialog, Field, Input, VStack } from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateFolder } from "api/web-gis";
import { toaster } from "design-system/toaster";
import type { OpenChangeDetails } from "node_modules/@chakra-ui/react/dist/types/components/dialog/namespace";
import { useForm } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1, "Folder name is required"),
});

type FormValues = z.infer<typeof schema>;

interface CreateFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  parentId?: string | null;
}

export const CreateFolderModal = ({
  isOpen,
  onClose,
  parentId = null,
}: CreateFolderModalProps) => {
  const { mutateAsync: createFolder, isPending } = useCreateFolder();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "" },
  });

  const onSubmit = async ({ name }: FormValues) => {
    try {
      await createFolder({ name, parent: parentId });

      toaster.create({
        title: "Folder created",
        type: "success",
        description: `Successfully created folder '${name}'.`,
      });

      reset();
      onClose();
    } catch (err) {
      console.error(err);
      toaster.create({
        title: "Error creating folder",
        type: "error",
        description:
          err instanceof Error ? err.message : "An unknown error occurred.",
      });
    }
  };

  const onOpenChange = (event: OpenChangeDetails) => {
    if (!event.open) {
      reset();
      onClose();
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Backdrop bg="blackAlpha.300" backdropFilter="blur(2px)" />
      <Dialog.Positioner>
        <Dialog.Content className="create-folder-modal-content">
          <Dialog.Header>
            <Dialog.Title>Create New Folder</Dialog.Title>
          </Dialog.Header>
          <Dialog.Body>
            <VStack gap="1rem">
              <Field.Root invalid={!!errors.name}>
                <Field.Label>Folder Name</Field.Label>
                <Input
                  {...register("name")}
                  placeholder="e.g., Site Plans"
                  disabled={isPending}
                />
                {errors.name && (
                  <Field.ErrorText>{errors.name.message}</Field.ErrorText>
                )}
              </Field.Root>
            </VStack>
          </Dialog.Body>
          <Dialog.Footer>
            <Button
              variant="ghost"
              mr={3}
              onClick={onClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              colorPalette="palette.brand"
              onClick={handleSubmit(onSubmit)}
              loading={isPending}
              disabled={!isValid || isPending}
            >
              Create
            </Button>
          </Dialog.Footer>
          <Dialog.CloseTrigger />
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
};

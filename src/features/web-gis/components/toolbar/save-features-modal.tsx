import {
  Button,
  Dialog,
  Field,
  Input,
  NativeSelect,
  VStack,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useAddLayer,
  useCreateEmptyDataset,
  useDatasetsNodes,
  useSaveFeatures,
  type LayerResponse,
} from "api/web-gis";
import { toaster } from "design-system/toaster";
import filter from "lodash/filter";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { DatasetNodeType, type DatasetNode } from "../../types";

const schema = z.object({
  name: z.string().min(1, "Dataset name is required"),
  parent: z.string(),
});

type FormValues = z.infer<typeof schema>;

interface SaveFeaturesModalProps {
  isOpen: boolean;
  onClose: () => void;
  features: GeoJSON.Feature[];
  onComplete: (layer: LayerResponse) => void;
}

export const SaveFeaturesModal = ({
  isOpen,
  onClose,
  features,
  onComplete,
}: SaveFeaturesModalProps) => {
  // APIs.
  const { data: datasetNodes } = useDatasetsNodes();
  const { mutateAsync: sendCreateEmptyDataset } = useCreateEmptyDataset();
  const { mutateAsync: sendAddLayer } = useAddLayer();
  const { mutateAsync: sendSaveFeatures } = useSaveFeatures();

  // Hooks.
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isValid },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", parent: "root" },
  });

  // Variables.
  const folders = useMemo(
    () =>
      filter(
        datasetNodes?.data ?? [],
        (node: DatasetNode) => node.type === DatasetNodeType.FOLDER
      ),
    [datasetNodes]
  );

  // Handlers.
  const onSubmit = async ({ name, parent }: FormValues) => {
    try {
      // 1. Create Vector Dataset.
      const datasetResponse = await sendCreateEmptyDataset({
        name,
        parent: parent === "root" ? null : parent,
      });

      const newDataset = datasetResponse.data.data?.dataset;
      const newDatasetId = newDataset?.id;

      if (!newDatasetId) {
        throw new Error("Failed to create the associated dataset component.");
      }

      // 2. Create matching Vector Layer.
      const layerResponse = await sendAddLayer({
        name,
        source: newDatasetId,
        style: {},
      });

      const newLayer = layerResponse.data.data;

      if (!newLayer?.id) {
        throw new Error("Failed to formulate layer.");
      }

      // 3. Save features to backend.
      await sendSaveFeatures({ dataset: newDatasetId, features });

      toaster.create({
        title: "Saved vector geometries",
        type: "success",
        description: `Successfully attached ${features.length} points to layer ${name}.`,
      });

      onComplete(newLayer);
      reset();
      onClose();
    } catch (error) {
      console.error(error);

      toaster.create({
        title: "Error capturing vectors",
        type: "error",
        description:
          error instanceof Error ? error.message : "An unknown error occurred.",
      });
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && onClose()}>
      <Dialog.Backdrop bg="blackAlpha.300" backdropFilter="blur(2px)" />
      <Dialog.Positioner>
        <Dialog.Content className="save-features-modal-content">
          <Dialog.Header>
            <Dialog.Title>Create Vector Dataset & Save</Dialog.Title>
          </Dialog.Header>
          <Dialog.Body>
            <VStack gap="1rem">
              <Field.Root invalid={!!errors.name}>
                <Field.Label>Dataset Name</Field.Label>
                <Input
                  {...register("name")}
                  placeholder="e.g., Construction Sites"
                  disabled={isSubmitting}
                />

                {errors.name && (
                  <Field.ErrorText>{errors.name.message}</Field.ErrorText>
                )}
              </Field.Root>

              <Field.Root disabled={isSubmitting}>
                <Field.Label>Folder Location</Field.Label>
                <NativeSelect.Root disabled={isSubmitting}>
                  <NativeSelect.Field {...register("parent")}>
                    <option value="root">Root Directory</option>
                    {folders.map((folder: DatasetNode) => (
                      <option key={folder.id} value={folder.id}>
                        {folder.name}
                      </option>
                    ))}
                  </NativeSelect.Field>
                  <NativeSelect.Indicator />
                </NativeSelect.Root>
              </Field.Root>
            </VStack>
          </Dialog.Body>
          <Dialog.Footer>
            <Button
              variant="ghost"
              mr={3}
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              colorPalette="palette.brand"
              onClick={handleSubmit(onSubmit)}
              loading={isSubmitting}
              disabled={!isValid || isSubmitting}
            >
              Create & Save
            </Button>
          </Dialog.Footer>
          <Dialog.CloseTrigger />
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
};

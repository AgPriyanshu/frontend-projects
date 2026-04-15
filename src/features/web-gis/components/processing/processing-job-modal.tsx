import {
  Button,
  Dialog,
  Field,
  Input,
  NativeSelect,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import {
  useSubmitProcessingJob,
  useDatasetsNodes,
  type ProcessingToolDefinition,
} from "api/web-gis";
import { toaster } from "design-system/toaster";
import { useMemo } from "react";
import { ToolParameterForm } from "./tool-parameter-form";

interface ProcessingJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  tool: ProcessingToolDefinition;
}

export const ProcessingJobModal = ({
  isOpen,
  onClose,
  tool,
}: ProcessingJobModalProps) => {
  const { data: datasetNodes } = useDatasetsNodes();
  const { mutateAsync: submitJob } = useSubmitProcessingJob();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Record<string, unknown>>({
    defaultValues: { inputDatasetId: "", outputName: "" },
  });

  // Flatten all leaf dataset nodes compatible with this tool.
  const compatibleDatasets = useMemo(() => {
    const nodes = datasetNodes?.data ?? [];
    const result: Array<{ id: string; name: string; type: string }> = [];

    const walk = (list: typeof nodes) => {
      for (const node of list) {
        if (
          node.dataset &&
          tool.inputTypes.includes(node.dataset.type as never)
        ) {
          result.push({
            id: node.dataset.id,
            name: node.name,
            type: node.dataset.type,
          });
        }
        if (node.children?.length) walk(node.children);
      }
    };

    walk(nodes);
    return result;
  }, [datasetNodes, tool.inputTypes]);

  // All datasets (for dataset-type params like clip layer).
  const allDatasets = useMemo(() => {
    const nodes = datasetNodes?.data ?? [];
    const result: Array<{ id: string; name: string; type: string }> = [];

    const walk = (list: typeof nodes) => {
      for (const node of list) {
        if (node.dataset)
          result.push({
            id: node.dataset.id,
            name: node.name,
            type: node.dataset.type,
          });
        if (node.children?.length) walk(node.children);
      }
    };

    walk(nodes);
    return result;
  }, [datasetNodes]);

  const onSubmit = async (values: Record<string, unknown>) => {
    const inputDatasetId = String(values.inputDatasetId ?? "");
    const outputName = String(values.outputName ?? "").trim();

    if (!inputDatasetId) {
      toaster.create({ title: "Select an input dataset", type: "error" });
      return;
    }

    const parameters: Record<string, unknown> = {};

    for (const param of tool.parameters) {
      if (values[param.name] !== undefined && values[param.name] !== "") {
        parameters[param.name] =
          param.type === "number"
            ? Number(values[param.name])
            : param.type === "boolean"
              ? Boolean(values[param.name])
              : values[param.name];
      }
    }

    try {
      await submitJob({
        toolName: tool.toolName,
        inputDatasetIds: [inputDatasetId],
        parameters,
        outputName: outputName || undefined,
      });

      toaster.create({
        title: `${tool.label} job submitted`,
        type: "success",
        description: "Progress will appear in the Jobs panel.",
      });

      reset();
      onClose();
    } catch (error: unknown) {
      toaster.create({
        title: "Failed to submit job",
        type: "error",
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && onClose()}>
      <Dialog.Backdrop bg="blackAlpha.300" backdropFilter="blur(2px)" />
      <Dialog.Positioner>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>{tool.label}</Dialog.Title>
          </Dialog.Header>
          <Dialog.Body>
            <VStack gap="1rem" align="stretch">
              <Text fontSize="sm" color="fg.muted">
                {tool.description}
              </Text>

              <Field.Root invalid={!!errors.inputDatasetId}>
                <Field.Label>Input dataset</Field.Label>
                <NativeSelect.Root disabled={isSubmitting}>
                  <NativeSelect.Field
                    {...register("inputDatasetId", { required: true })}
                  >
                    <option value="">Select a dataset…</option>
                    {compatibleDatasets.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </NativeSelect.Field>
                  <NativeSelect.Indicator />
                </NativeSelect.Root>
              </Field.Root>

              <ToolParameterForm
                parameters={tool.parameters}
                register={register}
                errors={errors as Record<string, { message?: string }>}
                isSubmitting={isSubmitting}
                datasetOptions={allDatasets}
              />

              <Field.Root>
                <Field.Label>Output name</Field.Label>
                <Input
                  {...register("outputName")}
                  placeholder={`${tool.label} output`}
                  disabled={isSubmitting}
                />
              </Field.Root>
            </VStack>
          </Dialog.Body>
          <Dialog.Footer>
            <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              colorPalette="palette.brand"
              onClick={handleSubmit(onSubmit)}
              loading={isSubmitting}
            >
              Run
            </Button>
          </Dialog.Footer>
          <Dialog.CloseTrigger />
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
};

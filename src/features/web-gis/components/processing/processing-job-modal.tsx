import {
  Box,
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
import { useEffect, useMemo, useRef } from "react";
import { ToolParameterForm } from "./tool-parameter-form";

const AUTO_SUBMIT_DELAY_MS = 1000;

interface ProcessingJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  tool: ProcessingToolDefinition;
  /** Optional pre-filled values supplied by an agent action. */
  defaultValues?: Record<string, unknown>;
  /**
   * When true the modal previews the pre-filled form for 1 second then
   * automatically submits the job, mimicking an agent-driven "Run" click.
   */
  autoSubmit?: boolean;
}

export const ProcessingJobModal = ({
  isOpen,
  onClose,
  tool,
  defaultValues: externalDefaults,
  autoSubmit = false,
}: ProcessingJobModalProps) => {
  const { data: datasetNodes } = useDatasetsNodes();
  const { mutateAsync: submitJob } = useSubmitProcessingJob();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Record<string, unknown>>({
    defaultValues: { inputDatasetId: "", outputName: "", ...externalDefaults },
  });

  // Keep a stable ref to handleSubmit so the effect closure doesn't go stale.
  const handleSubmitRef = useRef(handleSubmit);
  handleSubmitRef.current = handleSubmit;

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

  // Auto-submit: show modal for 1 second then programmatically run the job.
  useEffect(() => {
    if (!autoSubmit || !isOpen) return;

    const timer = setTimeout(() => {
      handleSubmitRef.current(onSubmit)();
    }, AUTO_SUBMIT_DELAY_MS);

    return () => clearTimeout(timer);
    // onSubmit is stable within a render cycle — only re-run when isOpen/autoSubmit change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoSubmit, isOpen]);

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(e) => !e.open && onClose()}
      placement={"center"}
    >
      <Dialog.Backdrop bg="blackAlpha.300" backdropFilter="blur(2px)" />
      <Dialog.Positioner>
        <Dialog.Content>
          {/* Countdown progress bar — only visible during agent auto-submit */}
          {autoSubmit && (
            <Box
              position="absolute"
              top={0}
              left={0}
              right={0}
              h="3px"
              borderTopRadius="md"
              overflow="hidden"
              zIndex={1}
            >
              <Box
                h="full"
                bg="intent.primary"
                style={{
                  animation: `shrink ${AUTO_SUBMIT_DELAY_MS}ms linear forwards`,
                }}
                css={{
                  "@keyframes shrink": {
                    from: { width: "100%" },
                    to: { width: "0%" },
                  },
                }}
              />
            </Box>
          )}

          <Dialog.Header>
            <Dialog.Title>{tool.label}</Dialog.Title>
            {autoSubmit && (
              <Text fontSize="xs" color="intent.primary" mt={1}>
                ✦ Running automatically in 1 s…
              </Text>
            )}
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


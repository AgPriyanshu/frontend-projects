import { Badge, Box, Button, HStack, Progress, Text } from "@chakra-ui/react";
import {
  useCancelProcessingJob,
  type ProcessingJobResponse,
} from "api/web-gis";
import { toaster } from "design-system/toaster";

interface ProcessingJobItemProps {
  job: ProcessingJobResponse;
  onAddToMap?: (job: ProcessingJobResponse) => void;
}

const statusColor: Record<string, string> = {
  pending: "yellow",
  processing: "blue",
  completed: "green",
  failed: "red",
};

export const ProcessingJobItem = ({
  job,
  onAddToMap,
}: ProcessingJobItemProps) => {
  const { mutateAsync: cancelJob, isPending: isCancelling } =
    useCancelProcessingJob();

  const handleCancel = async () => {
    try {
      await cancelJob(job.id);
      toaster.create({ title: "Job cancelled", type: "info" });
    } catch {
      toaster.create({ title: "Failed to cancel job", type: "error" });
    }
  };

  return (
    <Box
      borderWidth="1px"
      borderColor="border.default"
      borderRadius="md"
      p="0.75rem"
      w="full"
    >
      <HStack justify="space-between" mb="0.25rem">
        <Text fontSize="sm" fontWeight="medium" truncate>
          {job.toolName}
        </Text>
        <Badge colorPalette={statusColor[job.status] ?? "gray"} size="sm">
          {job.status}
        </Badge>
      </HStack>

      {(job.status === "processing" || job.status === "pending") && (
        <Progress.Root
          value={job.progress}
          max={100}
          size="xs"
          colorPalette="blue"
          mb="0.5rem"
        >
          <Progress.Track>
            <Progress.Range />
          </Progress.Track>
        </Progress.Root>
      )}

      {job.status === "failed" && job.errorMessage && (
        <Text fontSize="xs" color="red.500" mb="0.5rem" truncate>
          {job.errorMessage}
        </Text>
      )}

      <HStack justify="flex-end" gap="0.5rem">
        {(job.status === "pending" || job.status === "processing") && (
          <Button
            size="xs"
            variant="ghost"
            colorPalette="red"
            onClick={handleCancel}
            loading={isCancelling}
          >
            Cancel
          </Button>
        )}

        {job.status === "completed" && job.outputDataset && onAddToMap && (
          <Button
            size="xs"
            variant="outline"
            colorPalette="palette.brand"
            onClick={() => onAddToMap(job)}
          >
            Add to map
          </Button>
        )}
      </HStack>
    </Box>
  );
};

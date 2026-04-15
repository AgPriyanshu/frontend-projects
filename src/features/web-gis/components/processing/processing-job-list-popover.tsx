import { Box, Button, Popover, Text, VStack } from "@chakra-ui/react";
import {
  useAddLayer,
  useProcessingJobs,
  type ProcessingJobResponse,
} from "api/web-gis";
import { toaster } from "design-system/toaster";
import { ProcessingJobItem } from "./processing-job-item";

interface ProcessingJobListPopoverProps {
  activeCount: number;
}

export const ProcessingJobListPopover = ({
  activeCount,
}: ProcessingJobListPopoverProps) => {
  const { data } = useProcessingJobs();
  const { mutateAsync: addLayer } = useAddLayer();

  const jobs = data?.data ?? [];

  const handleAddToMap = async (job: ProcessingJobResponse) => {
    if (!job.outputDataset) return;

    try {
      await addLayer({ name: job.toolName, source: job.outputDataset });
      toaster.create({
        title: `${job.toolName} added to map`,
        type: "success",
      });
    } catch {
      toaster.create({ title: "Failed to add layer", type: "error" });
    }
  };

  return (
    <Popover.Root positioning={{ placement: "bottom-end" }}>
      <Popover.Trigger asChild>
        <Button size="sm" variant="outline" position="relative">
          Jobs
          {activeCount > 0 && (
            <Box
              as="span"
              position="absolute"
              top="-6px"
              right="-6px"
              bg="red.500"
              color="white"
              borderRadius="full"
              fontSize="10px"
              w="16px"
              h="16px"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              {activeCount}
            </Box>
          )}
        </Button>
      </Popover.Trigger>

      <Popover.Positioner>
        <Popover.Content w="320px" maxH="420px" overflow="hidden">
          <Popover.Header>
            <Text fontWeight="semibold">Processing Jobs</Text>
          </Popover.Header>
          <Popover.Body overflowY="auto" maxH="360px">
            {jobs.length === 0 ? (
              <Text fontSize="sm" color="fg.muted">
                No jobs yet.
              </Text>
            ) : (
              <VStack gap="0.5rem" align="stretch">
                {jobs.slice(0, 10).map((job) => (
                  <ProcessingJobItem
                    key={job.id}
                    job={job}
                    onAddToMap={handleAddToMap}
                  />
                ))}
              </VStack>
            )}
          </Popover.Body>
        </Popover.Content>
      </Popover.Positioner>
    </Popover.Root>
  );
};

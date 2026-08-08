import {
  Badge,
  Button,
  Flex,
  Input,
  Popover,
  Text,
  VStack,
} from "@chakra-ui/react";
import type { WorkflowRunResponse } from "api/workflow";

const RUN_STATUS_COLOR: Record<string, string> = {
  pending: "gray",
  running: "blue",
  completed: "green",
  failed: "red",
  cancelled: "gray",
};

interface WorkflowToolbarProps {
  name: string;
  onNameChange: (name: string) => void;
  onSave: () => void;
  onRun: () => void;
  isSaving: boolean;
  isRunning: boolean;
  canRun: boolean;
  runs: WorkflowRunResponse[];
}

export const WorkflowToolbar = ({
  name,
  onNameChange,
  onSave,
  onRun,
  isSaving,
  isRunning,
  canRun,
  runs,
}: WorkflowToolbarProps) => {
  return (
    <Flex
      className="workflow-toolbar"
      w="full"
      align="center"
      justify="space-between"
      gap={3}
      px={3}
      py={2}
      borderWidth="1px"
      borderColor="border.default"
      borderRadius="lg"
    >
      <Input
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
        placeholder="Untitled workflow"
        size="sm"
        w="260px"
      />

      <Flex gap={2} align="center">
        <Popover.Root positioning={{ placement: "bottom-end" }}>
          <Popover.Trigger asChild>
            <Button size="sm" variant="outline">
              Runs
            </Button>
          </Popover.Trigger>
          <Popover.Positioner>
            <Popover.Content w="300px" maxH="360px" overflow="hidden">
              <Popover.Header>
                <Text fontWeight="semibold">Run History</Text>
              </Popover.Header>
              <Popover.Body overflowY="auto" maxH="300px">
                {runs.length === 0 ? (
                  <Text fontSize="sm" color="text.muted">
                    No runs yet.
                  </Text>
                ) : (
                  <VStack gap={2} align="stretch">
                    {runs.map((run) => (
                      <Flex key={run.id} justify="space-between" align="center">
                        <Text fontSize="xs" color="text.muted">
                          {new Date(run.createdAt).toLocaleString()}
                        </Text>
                        <Badge colorPalette={RUN_STATUS_COLOR[run.status]}>
                          {run.status}
                        </Badge>
                      </Flex>
                    ))}
                  </VStack>
                )}
              </Popover.Body>
            </Popover.Content>
          </Popover.Positioner>
        </Popover.Root>

        <Button size="sm" variant="outline" onClick={onSave} loading={isSaving}>
          Save
        </Button>
        <Button
          size="sm"
          colorPalette="brand"
          bg="intent.primary"
          color="white"
          onClick={onRun}
          loading={isRunning}
          disabled={!canRun}
        >
          Run
        </Button>
      </Flex>
    </Flex>
  );
};

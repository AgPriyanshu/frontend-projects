import { Box, Button, Flex, NativeSelect, Text } from "@chakra-ui/react";
import { useDatasetsNodes, useProcessingTools } from "api/web-gis";
import {
  useCreateWorkflow,
  useSubmitWorkflowRun,
  useUpdateWorkflow,
  useWorkflow,
  useWorkflowRun,
  useWorkflowRuns,
  useWorkflows,
} from "api/workflow";
import { toaster } from "design-system/toaster";
import { useMemo, useRef, useState } from "react";

import {
  NodeConfigPanel,
  NodePalette,
  WorkflowCanvas,
  WorkflowToolbar,
  type WorkflowCanvasHandle,
} from "./components";
import type { CanvasNode } from "./types";

const flattenDatasetOptions = (
  nodes: {
    id: string;
    name: string;
    dataset: { id: string; fileName: string; type: string } | null;
    children: unknown[];
  }[]
): Array<{ id: string; name: string; type: string }> => {
  const result: Array<{ id: string; name: string; type: string }> = [];

  const walk = (list: typeof nodes) => {
    list.forEach((node) => {
      if (node.dataset) {
        result.push({
          id: node.dataset.id,
          name: node.dataset.fileName || node.name,
          type: node.dataset.type,
        });
      } else {
        walk(node.children as typeof nodes);
      }
    });
  };

  walk(nodes);

  return result;
};

export const WorkflowBuilder = () => {
  const [workflowId, setWorkflowId] = useState<string | null>(null);
  const [name, setName] = useState("Untitled workflow");
  const [selectedNode, setSelectedNode] = useState<CanvasNode | null>(null);
  const [activeRunId, setActiveRunId] = useState<string | null>(null);

  const canvasRef = useRef<WorkflowCanvasHandle>(null);

  const { data: workflowsResp } = useWorkflows();
  const { data: workflowResp } = useWorkflow(workflowId);
  const { data: toolsResp } = useProcessingTools();
  const { data: datasetNodesResp } = useDatasetsNodes();
  const { data: runsResp } = useWorkflowRuns(workflowId);
  const { data: activeRunResp } = useWorkflowRun(workflowId, activeRunId);

  const { mutateAsync: createWorkflow, isPending: isCreating } =
    useCreateWorkflow();
  const { mutateAsync: updateWorkflow, isPending: isUpdating } =
    useUpdateWorkflow();
  const { mutateAsync: submitRun, isPending: isSubmittingRun } =
    useSubmitWorkflowRun();

  const workflows = workflowsResp?.data ?? [];
  const tools = toolsResp?.data.tools ?? [];
  const runs = runsResp?.data ?? [];

  const datasetOptions = useMemo(
    () =>
      datasetNodesResp
        ? flattenDatasetOptions(
            datasetNodesResp.data as Parameters<typeof flattenDatasetOptions>[0]
          )
        : [],
    [datasetNodesResp]
  );

  const nodeStatuses = useMemo(() => {
    const run = activeRunResp?.data;

    if (!run) {
      return {};
    }

    return Object.fromEntries(
      (run.nodeRuns ?? []).map((nodeRun) => [
        nodeRun.nodeId,
        {
          status: nodeRun.status,
          errorMessage: nodeRun.errorMessage,
          outputDataset: nodeRun.outputDataset,
        },
      ])
    );
  }, [activeRunResp]);

  const handleSelectWorkflow = (id: string) => {
    setWorkflowId(id || null);
    setActiveRunId(null);
    setSelectedNode(null);

    const workflow = workflows.find((w) => w.id === id);
    setName(workflow?.name ?? "Untitled workflow");
  };

  const handleNew = () => {
    setWorkflowId(null);
    setActiveRunId(null);
    setSelectedNode(null);
    setName("Untitled workflow");
  };

  const handleSave = async () => {
    const definition = canvasRef.current?.getDefinition();

    if (!definition) {
      return;
    }

    try {
      if (workflowId) {
        await updateWorkflow({ id: workflowId, payload: { name, definition } });
      } else {
        const response = await createWorkflow({ name, definition });
        setWorkflowId(response.data.data.id);
      }

      toaster.create({ title: "Workflow saved", type: "success" });
    } catch {
      toaster.create({ title: "Failed to save workflow", type: "error" });
    }
  };

  const handleRun = async () => {
    if (!workflowId) {
      return;
    }

    try {
      const response = await submitRun(workflowId);
      setActiveRunId(response.data.data.id);
      toaster.create({ title: "Workflow run started", type: "info" });
    } catch {
      toaster.create({ title: "Failed to start run", type: "error" });
    }
  };

  const handleApplyParams = (
    nodeId: string,
    params: Record<string, unknown>
  ) => {
    canvasRef.current?.updateNodeParams(nodeId, params);
  };

  return (
    <Flex
      className="workflow-builder"
      direction="column"
      w="full"
      h="full"
      p="1rem"
      gap="0.75rem"
    >
      <Flex align="center" gap={2}>
        <Text fontSize="xs" color="text.muted">
          Workflow:
        </Text>
        <NativeSelect.Root size="sm" w="240px">
          <NativeSelect.Field
            value={workflowId ?? ""}
            onChange={(e) => handleSelectWorkflow(e.target.value)}
          >
            <option value="">New workflow…</option>
            {workflows.map((workflow) => (
              <option key={workflow.id} value={workflow.id}>
                {workflow.name}
              </option>
            ))}
          </NativeSelect.Field>
          <NativeSelect.Indicator />
        </NativeSelect.Root>
        <Button size="sm" variant="ghost" onClick={handleNew}>
          New
        </Button>
      </Flex>

      <WorkflowToolbar
        name={name}
        onNameChange={setName}
        onSave={handleSave}
        onRun={handleRun}
        isSaving={isCreating || isUpdating}
        isRunning={isSubmittingRun}
        canRun={!!workflowId}
        runs={runs}
      />

      <Flex flex={1} gap="0.75rem" minH={0}>
        <NodePalette />

        <Box
          flex={1}
          borderWidth="1px"
          borderColor="border.default"
          borderRadius="lg"
          overflow="hidden"
        >
          <WorkflowCanvas
            ref={canvasRef}
            workflowId={workflowId}
            initialDefinition={workflowResp?.data.definition ?? null}
            tools={tools}
            nodeStatuses={nodeStatuses}
            selectedNodeId={selectedNode?.id ?? null}
            onSelectNode={setSelectedNode}
          />
        </Box>

        <NodeConfigPanel
          node={selectedNode}
          tools={tools}
          datasetOptions={datasetOptions}
          onApplyParams={handleApplyParams}
        />
      </Flex>
    </Flex>
  );
};

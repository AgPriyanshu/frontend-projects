import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Connection,
  type Edge,
  type NodeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { ProcessingToolDefinition } from "api/web-gis";
import type { WorkflowDefinition } from "api/workflow";
import { useColorMode } from "design-system/color-mode";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";

import { NODE_STATUS_MINIMAP_COLOR } from "../constants";
import type {
  CanvasNode,
  CanvasNodeStatus,
  OperationNode,
  PalettePayload,
  SourceNode,
} from "../types";
import { WORKFLOW_NODE_DRAG_TYPE } from "../types";
import { OperationNode as OperationNodeComponent } from "./nodes/operation-node";
import { SourceNode as SourceNodeComponent } from "./nodes/source-node";

const NODE_TYPES: NodeTypes = {
  source: SourceNodeComponent,
  operation: OperationNodeComponent,
};

export interface NodeStatusInfo {
  status: CanvasNodeStatus;
  errorMessage?: string;
  outputDataset?: string | null;
}

export interface WorkflowCanvasHandle {
  getDefinition: () => WorkflowDefinition;
  updateNodeParams: (nodeId: string, params: Record<string, unknown>) => void;
}

interface WorkflowCanvasProps {
  workflowId: string | null;
  initialDefinition: WorkflowDefinition | null;
  tools: ProcessingToolDefinition[];
  nodeStatuses: Record<string, NodeStatusInfo>;
  selectedNodeId: string | null;
  onSelectNode: (node: CanvasNode | null) => void;
}

const definitionToGraph = (
  definition: WorkflowDefinition | null,
  toolMap: Map<string, ProcessingToolDefinition>
): { nodes: CanvasNode[]; edges: Edge[] } => {
  if (!definition) {
    return { nodes: [], edges: [] };
  }

  const nodes: CanvasNode[] = definition.nodes.map((node) => {
    if (node.type === "source") {
      const sourceNode: SourceNode = {
        id: node.id,
        type: "source",
        position: node.position,
        data: {
          datasetId: node.datasetId,
          datasetName: node.datasetName ?? node.datasetId,
          datasetType: node.datasetType,
          status: "idle",
        },
      };
      return sourceNode;
    }

    const tool = toolMap.get(node.toolName);
    const operationNode: OperationNode = {
      id: node.id,
      type: "operation",
      position: node.position,
      data: {
        toolName: node.toolName,
        toolLabel: tool?.label ?? node.toolName,
        params: node.params ?? {},
        status: "idle",
      },
    };
    return operationNode;
  });

  const edges: Edge[] = definition.edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    type: "smoothstep",
    style: { stroke: "#94a3b8", strokeWidth: 2 },
  }));

  return { nodes, edges };
};

const nodeOutputType = (
  node: CanvasNode,
  toolMap: Map<string, ProcessingToolDefinition>
): string | undefined => {
  if (node.type === "source") {
    return node.data.datasetType;
  }

  return toolMap.get(node.data.toolName)?.outputType;
};

const WorkflowCanvasInner = forwardRef<
  WorkflowCanvasHandle,
  WorkflowCanvasProps
>(
  (
    {
      workflowId,
      initialDefinition,
      tools,
      nodeStatuses,
      selectedNodeId,
      onSelectNode,
    },
    ref
  ) => {
    const { screenToFlowPosition } = useReactFlow();
    const { colorMode } = useColorMode();
    const isDark = colorMode === "dark";

    const toolMap = useMemo(
      () => new Map(tools.map((tool) => [tool.toolName, tool])),
      [tools]
    );

    const initialGraph = useMemo(
      () => definitionToGraph(initialDefinition, toolMap),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [initialDefinition]
    );

    const [nodes, setNodes, onNodesChange] = useNodesState<CanvasNode>(
      initialGraph.nodes
    );
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialGraph.edges);
    const [loadedWorkflowId, setLoadedWorkflowId] = useState(workflowId);

    // Reset the canvas only when a different workflow is loaded. Keying this on
    // the definition's object identity would also fire on every background
    // refetch (e.g. on window focus), discarding unsaved edits and live status.
    useEffect(() => {
      if (workflowId === loadedWorkflowId) {
        return;
      }

      // Wait for the newly selected workflow's definition to arrive.
      if (workflowId !== null && initialDefinition === null) {
        return;
      }

      setNodes(initialGraph.nodes);
      setEdges(initialGraph.edges);
      setLoadedWorkflowId(workflowId);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [workflowId, initialDefinition]);

    // Merge live run status into node data without disturbing position/selection.
    useEffect(() => {
      if (Object.keys(nodeStatuses).length === 0) {
        return;
      }

      setNodes((current) =>
        current.map((node) => {
          const info = nodeStatuses[node.id];

          if (!info) {
            return node;
          }

          return {
            ...node,
            data: {
              ...node.data,
              status: info.status,
              errorMessage: info.errorMessage,
            },
          } as CanvasNode;
        })
      );
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [nodeStatuses]);

    const isValidConnection = useCallback(
      (connection: Connection | Edge) => {
        const sourceNode = nodes.find((n) => n.id === connection.source);
        const targetNode = nodes.find((n) => n.id === connection.target);

        if (!sourceNode || !targetNode || targetNode.type !== "operation") {
          return false;
        }

        const outputType = nodeOutputType(sourceNode, toolMap);
        const tool = toolMap.get(targetNode.data.toolName);

        if (!tool || !outputType) {
          return false;
        }

        return tool.inputTypes.includes(outputType as never);
      },
      [nodes, toolMap]
    );

    const onConnect = useCallback(
      (connection: Connection) => {
        setEdges((current) =>
          addEdge(
            {
              ...connection,
              type: "smoothstep",
              style: { stroke: "#94a3b8", strokeWidth: 2 },
            },
            current
          )
        );
      },
      [setEdges]
    );

    const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = "copy";
    }, []);

    const onDrop = useCallback(
      (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();

        const raw = event.dataTransfer.getData(WORKFLOW_NODE_DRAG_TYPE);

        if (!raw) {
          return;
        }

        let payload: PalettePayload;

        // The transfer type is shared with plain text drops, so ignore anything
        // that is not a palette payload.
        try {
          payload = JSON.parse(raw);
        } catch {
          return;
        }

        if (payload?.kind !== "source" && payload?.kind !== "operation") {
          return;
        }

        const position = screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        });
        const id = crypto.randomUUID();

        const newNode: CanvasNode =
          payload.kind === "source"
            ? {
                id,
                type: "source",
                position,
                data: {
                  datasetId: payload.datasetId,
                  datasetName: payload.datasetName,
                  datasetType: payload.datasetType,
                  status: "idle",
                },
              }
            : {
                id,
                type: "operation",
                position,
                data: {
                  toolName: payload.toolName,
                  toolLabel: payload.toolLabel,
                  params: {},
                  status: "idle",
                },
              };

        setNodes((current) => [...current, newNode]);
      },
      [screenToFlowPosition, setNodes]
    );

    useImperativeHandle(
      ref,
      () => ({
        getDefinition: () => ({
          nodes: nodes.map((node) =>
            node.type === "source"
              ? {
                  id: node.id,
                  type: "source" as const,
                  datasetId: node.data.datasetId,
                  datasetName: node.data.datasetName,
                  datasetType: node.data.datasetType as never,
                  position: node.position,
                }
              : {
                  id: node.id,
                  type: "operation" as const,
                  toolName: node.data.toolName,
                  params: node.data.params,
                  position: node.position,
                }
          ),
          edges: edges.map((edge) => ({
            id: edge.id,
            source: edge.source,
            target: edge.target,
          })),
        }),
        updateNodeParams: (nodeId, params) => {
          setNodes((current) =>
            current.map((node) =>
              node.id === nodeId && node.type === "operation"
                ? { ...node, data: { ...node.data, params } }
                : node
            )
          );
        },
      }),
      [nodes, edges, setNodes]
    );

    const nodesWithSelection = nodes.map((node) => ({
      ...node,
      selected: node.id === selectedNodeId,
    }));

    return (
      // The drop handlers live on a plain wrapper so they are guaranteed to
      // reach the DOM regardless of how ReactFlow treats unknown props.
      <div
        className="workflow-canvas"
        style={{ width: "100%", height: "100%" }}
        onDragOver={onDragOver}
        onDrop={onDrop}
      >
        <ReactFlow
          style={{ width: "100%", height: "100%" }}
          colorMode={isDark ? "dark" : "light"}
          nodes={nodesWithSelection}
          edges={edges}
          nodeTypes={NODE_TYPES}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          isValidConnection={isValidConnection}
          onNodeClick={(_event, node) =>
            onSelectNode(
              node.id === selectedNodeId ? null : (node as CanvasNode)
            )
          }
          onPaneClick={() => onSelectNode(null)}
          fitView
          minZoom={0.2}
          maxZoom={2}
        >
          <Background gap={20} color={isDark ? "#3f3f46" : "#e2e8f0"} />
          <Controls />
          <MiniMap
            pannable
            zoomable
            style={{ width: 160, height: 110 }}
            nodeColor={(node) =>
              NODE_STATUS_MINIMAP_COLOR[
                ((node.data as { status?: CanvasNodeStatus }).status ??
                  "idle") as CanvasNodeStatus
              ]
            }
            maskColor={isDark ? "rgba(0,0,0,0.35)" : "rgba(0,0,0,0.05)"}
          />
        </ReactFlow>
      </div>
    );
  }
);

WorkflowCanvasInner.displayName = "WorkflowCanvasInner";

export const WorkflowCanvas = forwardRef<
  WorkflowCanvasHandle,
  WorkflowCanvasProps
>((props, ref) => (
  <ReactFlowProvider>
    <WorkflowCanvasInner {...props} ref={ref} />
  </ReactFlowProvider>
));

WorkflowCanvas.displayName = "WorkflowCanvas";

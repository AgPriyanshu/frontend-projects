import type { WorkflowNodeRunStatus } from "api/workflow";
import type { Node } from "@xyflow/react";

export type CanvasNodeStatus = WorkflowNodeRunStatus | "idle";

export interface SourceNodeData extends Record<string, unknown> {
  datasetId: string;
  datasetName: string;
  datasetType?: string;
  status: CanvasNodeStatus;
  errorMessage?: string;
}

export interface OperationNodeData extends Record<string, unknown> {
  toolName: string;
  toolLabel: string;
  params: Record<string, unknown>;
  status: CanvasNodeStatus;
  errorMessage?: string;
}

export type SourceNode = Node<SourceNodeData, "source">;
export type OperationNode = Node<OperationNodeData, "operation">;
export type CanvasNode = SourceNode | OperationNode;

export interface PaletteSourcePayload {
  kind: "source";
  datasetId: string;
  datasetName: string;
  datasetType?: string;
}

export interface PaletteOperationPayload {
  kind: "operation";
  toolName: string;
  toolLabel: string;
}

export type PalettePayload = PaletteSourcePayload | PaletteOperationPayload;

export const WORKFLOW_NODE_DRAG_TYPE = "text/plain";

import type { DatasetType } from "api/web-gis";

export const WorkflowNodeKind = {
  SOURCE: "source",
  OPERATION: "operation",
} as const;

export type WorkflowNodeKind =
  (typeof WorkflowNodeKind)[keyof typeof WorkflowNodeKind];

export interface WorkflowSourceNodeData {
  id: string;
  type: typeof WorkflowNodeKind.SOURCE;
  datasetId: string;
  datasetName?: string;
  datasetType?: DatasetType;
  position: { x: number; y: number };
}

export interface WorkflowOperationNodeData {
  id: string;
  type: typeof WorkflowNodeKind.OPERATION;
  toolName: string;
  params?: Record<string, unknown>;
  position: { x: number; y: number };
}

export type WorkflowNodeDefinition =
  | WorkflowSourceNodeData
  | WorkflowOperationNodeData;

export interface WorkflowEdgeDefinition {
  id: string;
  source: string;
  target: string;
}

export interface WorkflowDefinition {
  nodes: WorkflowNodeDefinition[];
  edges: WorkflowEdgeDefinition[];
}

export interface WorkflowResponse {
  id: string;
  name: string;
  description: string;
  definition: WorkflowDefinition;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkflowPayload {
  name: string;
  description?: string;
  definition: WorkflowDefinition;
}

export type UpdateWorkflowPayload = Partial<CreateWorkflowPayload>;

export const WorkflowRunStatus = {
  PENDING: "pending",
  RUNNING: "running",
  COMPLETED: "completed",
  FAILED: "failed",
  CANCELLED: "cancelled",
} as const;

export type WorkflowRunStatus =
  (typeof WorkflowRunStatus)[keyof typeof WorkflowRunStatus];

export const WorkflowNodeRunStatus = {
  PENDING: "pending",
  RUNNING: "running",
  COMPLETED: "completed",
  FAILED: "failed",
  SKIPPED: "skipped",
} as const;

export type WorkflowNodeRunStatus =
  (typeof WorkflowNodeRunStatus)[keyof typeof WorkflowNodeRunStatus];

export interface WorkflowNodeRunResponse {
  id: string;
  nodeId: string;
  nodeType: WorkflowNodeKind;
  status: WorkflowNodeRunStatus;
  outputDataset: string | null;
  errorMessage: string;
  startedAt: string | null;
  completedAt: string | null;
}

export interface WorkflowRunResponse {
  id: string;
  workflow: string;
  status: WorkflowRunStatus;
  progress: number;
  errorMessage: string;
  nodeRuns: WorkflowNodeRunResponse[];
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

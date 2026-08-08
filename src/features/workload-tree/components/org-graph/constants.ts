import type { NodeTypes } from "@xyflow/react";
import { PersonNode } from "./person-node";
import type { LoadStatus } from "api/workload";

export const nodeTypes: NodeTypes = { person: PersonNode };

export const minimapColors: Record<LoadStatus, string> = {
  UNDER: "#22c55e",
  HEALTHY: "#fb923c",
  OVER: "#ef4444",
};

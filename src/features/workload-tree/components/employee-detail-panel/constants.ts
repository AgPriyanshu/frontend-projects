import type { WorkItemStatus } from "api/workload";

export const statusColorMapping: Record<WorkItemStatus, string> = {
  TODO: "gray",
  IN_PROGRESS: "blue",
  DONE: "green",
};

export const loadColorMapping = {
  UNDER: "yellow",
  HEALTHY: "green",
  OVER: "red",
} as const;

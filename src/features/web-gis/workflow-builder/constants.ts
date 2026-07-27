import type { CanvasNodeStatus } from "./types";

export const NODE_STATUS_BORDER: Record<CanvasNodeStatus, string> = {
  idle: "border.default",
  pending: "border.default",
  running: "blue.400",
  completed: "green.400",
  failed: "red.400",
  skipped: "gray.300",
};

export const NODE_STATUS_BADGE_BG: Record<CanvasNodeStatus, string> = {
  idle: "gray.400",
  pending: "gray.400",
  running: "blue.500",
  completed: "green.500",
  failed: "red.500",
  skipped: "gray.400",
};

// The minimap renders raw SVG, so it needs real colours rather than theme tokens.
export const NODE_STATUS_MINIMAP_COLOR: Record<CanvasNodeStatus, string> = {
  idle: "#94a3b8",
  pending: "#94a3b8",
  running: "#3b82f6",
  completed: "#22c55e",
  failed: "#ef4444",
  skipped: "#64748b",
};

export const NODE_STATUS_LABEL: Record<CanvasNodeStatus, string> = {
  idle: "",
  pending: "Pending",
  running: "Running",
  completed: "Done",
  failed: "Failed",
  skipped: "Skipped",
};

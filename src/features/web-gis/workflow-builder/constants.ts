import type { Tone } from "design-system/tone";
import type { CanvasNodeStatus } from "./types";

export const NODE_STATUS_TONE: Record<CanvasNodeStatus, Tone> = {
  idle: "neutral",
  pending: "neutral",
  running: "info",
  completed: "success",
  failed: "danger",
  skipped: "neutral",
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

export const ConnectionStatus = {
  Disconnected: "disconnected",
  Connecting: "connecting",
  Connected: "connected",
} as const;

export type ConnectionStatus =
  (typeof ConnectionStatus)[keyof typeof ConnectionStatus];

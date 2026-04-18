/**
 * Raw UI action as received over WebSocket from the backend.
 * The `app` field discriminates which ActionHandler should process it.
 */
export interface RawUIAction {
  app: string;
  action_type: string;
  payload: Record<string, unknown>;
}

/**
 * Result of executing a single action.
 */
export interface ActionResult {
  app: string;
  actionType: string;
  success: boolean;
  error?: string;
  data?: unknown;
}

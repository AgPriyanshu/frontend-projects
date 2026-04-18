import { ActionRegistry } from "./action-registry";
import type { ActionResult, RawUIAction } from "./types";

/**
 * Central dispatcher that processes batches of UI actions from the backend.
 *
 * For each raw action:
 * 1. Looks up the ActionHandler via ActionRegistry (by `app` field).
 * 2. Parses the raw action into a typed Action instance.
 * 3. Validates the action.
 * 4. Executes it via the handler.
 *
 * Unknown apps and invalid actions are logged and skipped gracefully.
 */
export class AgentExecutor {
  /**
   * Process a batch of raw actions received from the WebSocket.
   * Returns an array of ActionResults for observability.
   */
  static async executeBatch(
    rawActions: RawUIAction[]
  ): Promise<ActionResult[]> {
    const results: ActionResult[] = [];

    for (const raw of rawActions) {
      const result = await this.executeSingle(raw);
      results.push(result);
    }

    return results;
  }

  /**
   * Process a single raw action.
   */
  private static async executeSingle(raw: RawUIAction): Promise<ActionResult> {
    const { app, action_type } = raw;

    // --- Step 1: Look up handler ---
    const handler = ActionRegistry.getHandler(app);

    if (!handler) {
      console.warn(
        `[AgentExecutor] No handler registered for app "${app}" — skipping action "${action_type}".`
      );
      return {
        app,
        actionType: action_type,
        success: false,
        error: `No handler registered for app "${app}"`,
      };
    }

    // --- Step 2: Parse ---
    const action = handler.parse(raw);

    if (!action) {
      console.warn(
        `[AgentExecutor] Handler "${app}" could not parse action_type "${action_type}" — skipping.`
      );
      return {
        app,
        actionType: action_type,
        success: false,
        error: `Unsupported action_type "${action_type}" for app "${app}"`,
      };
    }

    // --- Step 3: Validate ---
    if (!action.validate()) {
      console.warn(
        `[AgentExecutor] Validation failed for ${app}/${action_type} — skipping.`
      );
      return {
        app,
        actionType: action_type,
        success: false,
        error: "Action validation failed",
      };
    }

    // --- Step 4: Execute ---
    try {
      const result = await handler.execute(action);
      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      console.error(
        `[AgentExecutor] Error executing ${app}/${action_type}:`,
        error
      );

      return {
        app,
        actionType: action_type,
        success: false,
        error: errorMessage,
      };
    }
  }
}

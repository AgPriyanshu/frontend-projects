import type { ActionResult, RawUIAction } from "./types";

// ---------------------------------------------------------------------------
// Action (base class)
// ---------------------------------------------------------------------------

/**
 * Abstract base class for a single executable action.
 *
 * Each concrete Action knows which app it belongs to, its action type,
 * and carries a typed payload. Subclasses can override `validate()` for
 * pre-execution checks.
 */
export abstract class Action {
  abstract readonly app: string;
  abstract readonly actionType: string;
  abstract readonly payload: Record<string, unknown>;

  /**
   * Optional pre-execution validation.
   * Return `true` if the action is valid and can be executed.
   */
  validate(): boolean {
    return true;
  }
}

// ---------------------------------------------------------------------------
// ActionHandler (base class)
// ---------------------------------------------------------------------------

/**
 * Abstract base class for an action handler.
 *
 * Each feature module (Web GIS, Todo, URL Shortener, etc.) implements
 * one handler that knows how to parse raw WebSocket actions into typed
 * Action instances and execute them against the feature's stores/APIs.
 */
export abstract class ActionHandler {
  /** The app identifier this handler is responsible for (must match backend `app` field). */
  abstract readonly app: string;

  /** Return the list of action_type values this handler supports. */
  abstract supportedActions(): string[];

  /**
   * Parse a raw WebSocket action into a typed Action instance.
   * Returns `null` if the action_type is not recognized.
   */
  abstract parse(raw: RawUIAction): Action | null;

  /**
   * Execute a single parsed action.
   */
  abstract execute(action: Action): Promise<ActionResult>;
}

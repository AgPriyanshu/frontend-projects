import type { ActionHandler } from "./action";

/**
 * Central registry where each feature module registers its ActionHandler.
 *
 * Handlers are keyed by their `app` identifier (e.g. "web_gis", "todo").
 * The AgentExecutor looks up handlers from this registry when dispatching
 * incoming actions from the backend.
 */
export class ActionRegistry {
  private static handlers = new Map<string, ActionHandler>();

  /**
   * Register an action handler for an app.
   * Logs a warning and skips if the app is already registered.
   */
  static register(handler: ActionHandler): void {
    if (this.handlers.has(handler.app)) {
      console.warn(
        `[ActionRegistry] Handler for app "${handler.app}" is already registered — skipping.`
      );
      return;
    }

    this.handlers.set(handler.app, handler);
    console.debug(
      `[ActionRegistry] Registered handler: ${handler.app} (actions: ${handler.supportedActions().join(", ")})`
    );
  }

  /**
   * Look up a handler by app name.
   */
  static getHandler(app: string): ActionHandler | undefined {
    return this.handlers.get(app);
  }

  /**
   * Return all registered handlers.
   */
  static getAllHandlers(): ActionHandler[] {
    return Array.from(this.handlers.values());
  }

  /**
   * Return all registered app names.
   */
  static getRegisteredApps(): string[] {
    return Array.from(this.handlers.keys());
  }

  /**
   * Clear all registered handlers. Useful for testing.
   */
  static clear(): void {
    this.handlers.clear();
  }
}

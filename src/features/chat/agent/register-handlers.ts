import { ActionRegistry } from "./action-registry";
import { WebGISActionHandler } from "../../web-gis/actions/web-gis-action-handler";
import { TodoActionHandler } from "../../todo/actions/todo-action-handler";
import { URLShortenerActionHandler } from "../../url-shortner/actions/url-shortener-action-handler";

/**
 * Register all app action handlers with the central ActionRegistry.
 *
 * Call this once at app startup (e.g. in the root component or entry point).
 * To add a new app's handler, simply import it and register here.
 */
export const registerAllHandlers = (): void => {
  ActionRegistry.register(new WebGISActionHandler());
  ActionRegistry.register(new TodoActionHandler());
  ActionRegistry.register(new URLShortenerActionHandler());
};

import { RoutePath } from "app/router/constants";
import { navigationService } from "shared/navigation/navigation-service";
import { Action } from "./action";
import type { ActionResult } from "./types";

const ROUTE_MAP: Record<string, string> = {
  todo: RoutePath.Todo,
  map: RoutePath.Map,
  home: RoutePath.Home,
  "url-shortner": RoutePath.URLShortner,
  "level-up": RoutePath.LevelUp,
  whiteboard: RoutePath.WhiteBoard,
  inventory: RoutePath.Inventory,
  store: RoutePath.Store,
};

export class NavigateAction extends Action {
  readonly app = "global";
  readonly actionType = "navigate";
  readonly payload: Record<string, unknown>;

  constructor(payload: Record<string, unknown>) {
    super();
    this.payload = payload;
  }

  validate(): boolean {
    return typeof this.payload.to === "string" && this.payload.to in ROUTE_MAP;
  }

  async execute(): Promise<ActionResult> {
    const path = ROUTE_MAP[this.payload.to as string];
    navigationService.navigate(path);
    return { app: "global", actionType: "navigate", success: true };
  }
}

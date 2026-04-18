import api from "api/api";
import { QueryKeys } from "api/query-keys";
import type { ApiResponse } from "api/types";
import { Action, ActionHandler } from "../../chat/agent/action";
import type { ActionResult, RawUIAction } from "../../chat/agent/types";

// ---------------------------------------------------------------------------
// Action classes
// ---------------------------------------------------------------------------

export class ShortenURLAction extends Action {
  readonly app = "url_shortener";
  readonly actionType = "shorten_url";
  readonly payload: { url: string };

  constructor(url: string) {
    super();
    this.payload = { url };
  }

  validate(): boolean {
    if (!this.payload.url) return false;
    try {
      new URL(this.payload.url);
      return true;
    } catch {
      return false;
    }
  }
}

export class ListURLsAction extends Action {
  readonly app = "url_shortener";
  readonly actionType = "list_urls";
  readonly payload = {};
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export class URLShortenerActionHandler extends ActionHandler {
  readonly app = "url_shortener";

  supportedActions(): string[] {
    return ["shorten_url", "list_urls"];
  }

  parse(raw: RawUIAction): Action | null {
    switch (raw.action_type) {
      case "shorten_url":
        return new ShortenURLAction((raw.payload.url as string) ?? "");
      case "list_urls":
        return new ListURLsAction();
      default:
        return null;
    }
  }

  async execute(action: Action): Promise<ActionResult> {
    try {
      switch (action.actionType) {
        case "shorten_url":
          return await this.handleShortenURL(action as ShortenURLAction);
        case "list_urls":
          return await this.handleListURLs();
        default:
          return {
            app: this.app,
            actionType: action.actionType,
            success: true,
          };
      }
    } catch (error) {
      return {
        app: this.app,
        actionType: action.actionType,
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  private async handleShortenURL(
    action: ShortenURLAction
  ): Promise<ActionResult> {
    const response = await api.post<
      ApiResponse<{ url: string; shortUrl: string }>
    >(QueryKeys.urls[0], { url: action.payload.url });

    return {
      app: this.app,
      actionType: action.actionType,
      success: true,
      data: response.data?.data,
    };
  }

  private async handleListURLs(): Promise<ActionResult> {
    const response = await api.get<ApiResponse<unknown[]>>(QueryKeys.urls[0]);

    return {
      app: this.app,
      actionType: "list_urls",
      success: true,
      data: response.data?.data ?? [],
    };
  }
}

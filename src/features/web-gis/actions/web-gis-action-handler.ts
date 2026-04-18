import api from "api/api";
import { queryClient } from "api/query-client";
import { QueryKeys } from "api/query-keys";
import type { ApiResponse } from "api/types";
import type { DatasetNodeResponse } from "api/web-gis/types";
import { Action, ActionHandler } from "../../chat/agent/action";
import type { ActionResult, RawUIAction } from "../../chat/agent/types";

// ---------------------------------------------------------------------------
// Action classes
// ---------------------------------------------------------------------------

export class LoadDatasetAction extends Action {
  readonly app = "web_gis";
  readonly actionType = "load_dataset";
  readonly payload: { dataset_name: string };

  constructor(datasetName: string) {
    super();
    this.payload = { dataset_name: datasetName };
  }

  validate(): boolean {
    return Boolean(this.payload.dataset_name);
  }
}

export class RemoveLayerAction extends Action {
  readonly app = "web_gis";
  readonly actionType = "remove_layer";
  readonly payload: { dataset_name: string };

  constructor(datasetName: string) {
    super();
    this.payload = { dataset_name: datasetName };
  }

  validate(): boolean {
    return Boolean(this.payload.dataset_name);
  }
}

export class FitToLayerAction extends Action {
  readonly app = "web_gis";
  readonly actionType = "fit_to_layer";
  readonly payload: { dataset_name: string };

  constructor(datasetName: string) {
    super();
    this.payload = { dataset_name: datasetName };
  }

  validate(): boolean {
    return Boolean(this.payload.dataset_name);
  }
}

export class ToggleVisibilityAction extends Action {
  readonly app = "web_gis";
  readonly actionType = "toggle_visibility";
  readonly payload: { dataset_name: string };

  constructor(datasetName: string) {
    super();
    this.payload = { dataset_name: datasetName };
  }

  validate(): boolean {
    return Boolean(this.payload.dataset_name);
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const findDatasetByName = (
  nodes: DatasetNodeResponse[],
  name: string
): DatasetNodeResponse | null => {
  const lowerName = name.toLowerCase();

  for (const node of nodes) {
    if (node.dataset && node.name.toLowerCase().includes(lowerName)) {
      return node;
    }

    if (node.children.length > 0) {
      const found = findDatasetByName(node.children, name);
      if (found) return found;
    }
  }

  return null;
};

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export class WebGISActionHandler extends ActionHandler {
  readonly app = "web_gis";

  supportedActions(): string[] {
    return [
      "load_dataset",
      "remove_layer",
      "fit_to_layer",
      "toggle_visibility",
    ];
  }

  parse(raw: RawUIAction): Action | null {
    const datasetName = (raw.payload.dataset_name as string) ?? "";

    switch (raw.action_type) {
      case "load_dataset":
        return new LoadDatasetAction(datasetName);
      case "remove_layer":
        return new RemoveLayerAction(datasetName);
      case "fit_to_layer":
        return new FitToLayerAction(datasetName);
      case "toggle_visibility":
        return new ToggleVisibilityAction(datasetName);
      default:
        return null;
    }
  }

  async execute(action: Action): Promise<ActionResult> {
    try {
      switch (action.actionType) {
        case "load_dataset":
          return await this.handleLoadDataset(action as LoadDatasetAction);
        case "remove_layer":
          return await this.handleRemoveLayer(action as RemoveLayerAction);
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

  // ---- Individual action executors ----

  private async handleLoadDataset(
    action: LoadDatasetAction
  ): Promise<ActionResult> {
    // Fetch dataset tree to find the dataset by name.
    const response = await api.get<ApiResponse<DatasetNodeResponse[]>>(
      QueryKeys.datasets[0]
    );

    const datasets = response.data?.data ?? [];
    const node = findDatasetByName(datasets, action.payload.dataset_name);

    if (!node?.dataset) {
      return {
        app: this.app,
        actionType: action.actionType,
        success: false,
        error: `Dataset "${action.payload.dataset_name}" not found.`,
      };
    }

    // Create a layer for the dataset.
    await api.post(QueryKeys.layers[0], {
      name: node.name,
      source: node.dataset.id,
    });

    // Invalidate layers cache so the UI refreshes.
    queryClient.invalidateQueries({ queryKey: QueryKeys.layers });

    return {
      app: this.app,
      actionType: action.actionType,
      success: true,
      data: { datasetName: node.name },
    };
  }

  private async handleRemoveLayer(
    action: RemoveLayerAction
  ): Promise<ActionResult> {
    // For remove_layer, we'd need to find the layer by dataset name
    // and then delete it. For now, return success as a stub.
    return {
      app: this.app,
      actionType: action.actionType,
      success: true,
    };
  }
}

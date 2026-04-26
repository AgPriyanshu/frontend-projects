import api from "api/api";
import { queryClient } from "api/query-client";
import { QueryKeys } from "api/query-keys";
import type { ApiResponse } from "api/types";
import type {
  DatasetNodeResponse,
  ProcessingToolDefinition,
  ProcessingToolsResponse,
} from "api/web-gis/types";
import { Action, ActionHandler } from "../../chat/agent/action";
import type { ActionResult, RawUIAction } from "../../chat/agent/types";
import { workspaceManager } from "shared/map/stores/workspace-manager";

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

export class MapZoomToAction extends Action {
  readonly app = "web_gis";
  readonly actionType = "map_zoom_to";
  readonly payload: { latitude: number; longitude: number };

  constructor(latitude: number, longitude: number) {
    super();
    this.payload = { latitude, longitude };
  }

  validate(): boolean {
    return (
      typeof this.payload.latitude === "number" &&
      typeof this.payload.longitude === "number"
    );
  }
}

export class OpenProcessingToolAction extends Action {
  readonly app = "web_gis";
  readonly actionType = "open_processing_tool";
  readonly payload: { toolName: string; defaults: Record<string, unknown> };

  constructor(toolName: string, defaults: Record<string, unknown>) {
    super();
    this.payload = { toolName, defaults };
  }

  validate(): boolean {
    return Boolean(this.payload.toolName);
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
      "map_zoom_to",
      "open_processing_tool",
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
      case "map_zoom_to":
        return new MapZoomToAction(
          raw.payload.latitude as number,
          raw.payload.longitude as number
        );
      case "open_processing_tool": {
        const toolName = (raw.payload.tool_name as string) ?? "";
        const defaults =
          (raw.payload.defaults as Record<string, unknown>) ?? {};
        return new OpenProcessingToolAction(toolName, defaults);
      }
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
        case "map_zoom_to":
          return this.handleMapZoomTo(action as MapZoomToAction);
        case "open_processing_tool":
          return this.handleOpenProcessingTool(
            action as OpenProcessingToolAction
          );
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
    return {
      app: this.app,
      actionType: action.actionType,
      success: true,
    };
  }

  private handleMapZoomTo(action: MapZoomToAction): ActionResult {
    const workspace = workspaceManager.activeWorkspace;

    if (!workspace) {
      return {
        app: this.app,
        actionType: action.actionType,
        success: false,
        error: "No active workspace.",
      };
    }

    workspace.mapStore.flyTo(
      [action.payload.longitude, action.payload.latitude],
      12
    );

    return { app: this.app, actionType: action.actionType, success: true };
  }

  private handleOpenProcessingTool(
    action: OpenProcessingToolAction
  ): ActionResult {
    const workspace = workspaceManager.activeWorkspace;

    if (!workspace) {
      return {
        app: this.app,
        actionType: action.actionType,
        success: false,
        error: "No active workspace.",
      };
    }

    const { toolName, defaults } = action.payload;

    const inputDatasetId = defaults?.inputDatasetId as string | undefined;

    if (inputDatasetId) {
      const layer = workspace.layerStore.layersArray.find(
        (l) => l.datasetId === inputDatasetId
      );
      if (layer) {
        workspace.layerStore.fitToLayer(layer.id);
      }
    }

    // Try to find the tool definition from React-Query cache first.
    // The queryFn returns AxiosResponse<ApiResponse<ProcessingToolsResponse>>
    const cached = queryClient.getQueryData<{
      data: ApiResponse<ProcessingToolsResponse>;
    }>(QueryKeys.processingTools);
    const lowerName = toolName.toLowerCase();
    const toolDef = cached?.data?.data?.tools?.find(
      (t) =>
        t.toolName.toLowerCase() === lowerName ||
        t.label.toLowerCase() === lowerName
    );

    if (toolDef) {
      workspace.processingUIStore.openTool(toolDef, defaults, true);
      return { app: this.app, actionType: action.actionType, success: true };
    }

    // Cache miss: build a minimal stub so the modal still opens.
    const stub: ProcessingToolDefinition = {
      toolName,
      label: toolName,
      description: "",
      category: "vector",
      inputTypes: ["vector"],
      parameters: [],
    };
    workspace.processingUIStore.openTool(stub, defaults, true);
    return { app: this.app, actionType: action.actionType, success: true };
  }
}

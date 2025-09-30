/**
 * LayerPanel Component - Demonstrates layer management UI
 *
 * Shows how to:
 * - Display layers from DataStore
 * - Toggle visibility
 * - Control opacity
 * - Reorder layers
 */

import { observer } from "mobx-react-lite";
import { workspaceManager } from "../managers";
import { Eye, EyeOff, Trash2, GripVertical, Plus } from "lucide-react";
import { loadDemoLayers, clearDemoLayers } from "../demo-data";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardAction,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const LayerPanel = observer(() => {
  const { dataManager: data } = workspaceManager;

  const handleToggleVisibility = (layerId: string) => {
    data.toggleLayerVisibility(layerId);
  };

  const handleOpacityChange = (layerId: string, opacity: number) => {
    data.setLayerOpacity(layerId, opacity);
  };

  const handleRemoveLayer = (layerId: string) => {
    data.removeLayer(layerId);
  };

  const handleLoadDemo = () => {
    loadDemoLayers();
  };

  const handleClearAll = () => {
    clearDemoLayers();
  };

  const layers = data.getLayersInOrder();

  if (layers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Layers</CardTitle>
          <CardDescription>No layers added yet</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleLoadDemo} className="w-full">
            <Plus size={16} />
            Load Demo Layers
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-h-[500px] overflow-hidden flex flex-col">
      <CardHeader>
        <CardTitle>Layers</CardTitle>
        <CardDescription>
          {data.visibleLayerCount} / {data.layerCount} visible
        </CardDescription>
        <CardAction>
          <Button
            onClick={handleClearAll}
            variant="destructive"
            size="sm"
            title="Clear all layers"
          >
            Clear All
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className="overflow-y-auto flex-1 space-y-2">
        {layers.map((layer) => (
          <div
            key={layer.id}
            className="p-3 border rounded-lg hover:bg-accent/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              {/* Drag handle */}
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 cursor-move text-muted-foreground"
              >
                <GripVertical size={14} />
              </Button>

              {/* Visibility toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => handleToggleVisibility(layer.id)}
              >
                {layer.visible ? <Eye size={16} /> : <EyeOff size={16} />}
              </Button>

              {/* Layer info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium truncate">
                    {layer.metadata?.name || layer.id}
                  </span>
                  <span className="px-1.5 py-0.5 text-xs bg-secondary text-secondary-foreground rounded">
                    {layer.type}
                  </span>
                </div>
                {layer.metadata?.description && (
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    {layer.metadata.description}
                  </p>
                )}
              </div>

              {/* Remove button */}
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-destructive hover:bg-destructive/10"
                onClick={() => handleRemoveLayer(layer.id)}
              >
                <Trash2 size={14} />
              </Button>
            </div>

            {/* Opacity slider */}
            <div className="mt-3 ml-14">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-16">
                  Opacity:
                </span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={layer.opacity * 100}
                  onChange={(e) =>
                    handleOpacityChange(layer.id, Number(e.target.value) / 100)
                  }
                  className="flex-1 h-1 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <span className="text-xs text-muted-foreground w-10 text-right">
                  {Math.round(layer.opacity * 100)}%
                </span>
              </div>
            </div>

            {/* Legend (if available) */}
            {layer.metadata?.legend && (
              <div className="mt-3 ml-14 space-y-1">
                <p className="text-xs font-medium text-muted-foreground">
                  Legend:
                </p>
                {layer.metadata.legend.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    {item.color && (
                      <div
                        className="w-3 h-3 rounded border"
                        style={{ backgroundColor: item.color }}
                      />
                    )}
                    <span className="text-xs text-muted-foreground">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
});

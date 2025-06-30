import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  MapPin,
  BarChart3,
  Zap,
  Route,
  Circle,
  Merge,
  Activity,
} from "lucide-react";

interface AnalysisToolsProps {
  selectedType: string;
  onTypeChange: (type: string) => void;
  useStreaming: boolean;
  onStreamingChange: (streaming: boolean) => void;
}

const analysisTypes = [
  {
    id: "spatial",
    label: "Spatial",
    icon: MapPin,
    description: "Analyze spatial relationships and patterns",
    color: "text-blue-600",
  },
  {
    id: "statistical",
    label: "Statistical",
    icon: BarChart3,
    description: "Statistical analysis of geospatial data",
    color: "text-green-600",
  },
  {
    id: "pattern",
    label: "Pattern",
    icon: Activity,
    description: "Identify patterns and clusters",
    color: "text-purple-600",
  },
  {
    id: "route",
    label: "Route",
    icon: Route,
    description: "Route analysis and optimization",
    color: "text-orange-600",
  },
  {
    id: "buffer",
    label: "Buffer",
    icon: Circle,
    description: "Buffer analysis and proximity",
    color: "text-cyan-600",
  },
  {
    id: "intersection",
    label: "Intersection",
    icon: Merge,
    description: "Spatial intersection analysis",
    color: "text-red-600",
  },
];

export function AnalysisTools({
  selectedType,
  onTypeChange,
  useStreaming,
  onStreamingChange,
}: AnalysisToolsProps) {
  return (
    <div className="space-y-2 sm:space-y-3">
      {/* Analysis Type Selection */}
      <div>
        <div className="text-xs font-medium text-muted-foreground mb-2">
          Analysis Type
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
          {analysisTypes.map((type) => {
            const Icon = type.icon;
            const isSelected = selectedType === type.id;

            return (
              <Button
                key={type.id}
                variant={isSelected ? "default" : "ghost"}
                size="sm"
                onClick={() => onTypeChange(type.id)}
                className={`h-auto p-1.5 sm:p-2 flex flex-col items-center gap-1 text-xs ${
                  isSelected ? "" : "hover:bg-muted"
                }`}
                title={type.description}
              >
                <Icon
                  className={`h-3 w-3 ${
                    isSelected ? "text-primary-foreground" : type.color
                  }`}
                />
                <span className="text-[10px] sm:text-xs leading-tight">{type.label}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Streaming Option */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="streaming"
          checked={useStreaming}
          onCheckedChange={onStreamingChange}
        />
        <label
          htmlFor="streaming"
          className="text-xs text-muted-foreground cursor-pointer flex items-center gap-1"
        >
          <Zap className="h-3 w-3" />
          <span className="hidden sm:inline">Stream responses</span>
          <span className="sm:hidden">Stream</span>
        </label>
      </div>

      {/* Quick Analysis Prompts - Hidden on mobile to save space */}
      <div className="hidden sm:block">
        <div className="text-xs font-medium text-muted-foreground mb-2">
          Quick Prompts
        </div>
        <div className="flex flex-wrap gap-1">
          {[
            "Analyze patterns",
            "Find clusters",
            "Calculate distances",
            "Show statistics",
          ].map((prompt) => (
            <Button
              key={prompt}
              variant="outline"
              size="sm"
              className="h-6 text-xs px-2"
              onClick={() => {
                // This would trigger sending the prompt
                // For now, it's just a visual element
              }}
            >
              {prompt}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

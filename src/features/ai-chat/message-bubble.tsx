import { memo } from "react";
import { User, Bot, Loader2, Eye, BarChart3, Map } from "lucide-react";
import type { ChatMessage } from "./types";

interface MessageBubbleProps {
  message: ChatMessage;
}

export const MessageBubble = memo(function MessageBubble({
  message,
}: MessageBubbleProps) {
  const isUser = message.role === "user";
  const isStreaming = message.isStreaming;

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(date);
  };

  const renderVisualizationPreview = () => {
    if (!message.metadata?.visualizations) return null;

    return (
      <div className="mt-2 sm:mt-3 space-y-2">
        <div className="text-xs font-medium text-muted-foreground flex items-center gap-1">
          <Eye className="h-3 w-3" />
          Geospatial Analysis Results
        </div>
        <div className="grid grid-cols-1 gap-2">
          {message.metadata.visualizations.map((viz, index) => (
            <div
              key={index}
              className="bg-muted/50 rounded-lg p-3 text-xs border"
            >
              <div className="flex items-center gap-1 font-medium mb-2">
                <Map className="h-3 w-3 shrink-0" />
                <span className="truncate">{viz.type.charAt(0).toUpperCase() + viz.type.slice(1)}</span>
              </div>
              
              {/* Layer Information - only for GeospatialVisualization */}
              {"layer_name" in viz && viz.layer_name && (
                <div className="mb-2">
                  <span className="font-medium">Layer:</span> {viz.layer_name}
                </div>
              )}
              
              {/* Feature Count - only for GeospatialVisualization */}
              {"feature_count" in viz && viz.feature_count && (
                <div className="mb-2">
                  <span className="font-medium">Features:</span> {viz.feature_count.toLocaleString()}
                </div>
              )}
              
              {/* Analysis Type - only for GeospatialVisualization */}
              {"style_type" in viz && viz.style_type && (
                <div className="mb-2">
                  <span className="font-medium">Analysis:</span> {viz.style_type}
                </div>
              )}
              
              {/* Field Statistics - only for GeospatialVisualization */}
              {"field_stats" in viz && viz.field_stats && (
                <div className="mt-2 p-2 bg-background rounded border">
                  <div className="font-medium mb-1">Field: {"style_field" in viz ? viz.style_field : "Unknown"}</div>
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    {viz.field_stats.min !== undefined && (
                      <div>Min: {viz.field_stats.min.toLocaleString()}</div>
                    )}
                    {viz.field_stats.max !== undefined && (
                      <div>Max: {viz.field_stats.max.toLocaleString()}</div>
                    )}
                    {viz.field_stats.avg !== undefined && (
                      <div>Avg: {viz.field_stats.avg.toLocaleString()}</div>
                    )}
                    {viz.field_stats.count !== undefined && (
                      <div>Count: {viz.field_stats.count.toLocaleString()}</div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Highlighted Features - only for GeospatialVisualization */}
              {"highlighted_features" in viz && viz.highlighted_features && viz.highlighted_features.length > 0 && (
                <div className="mt-2 text-blue-600">
                  <span className="font-medium">{viz.highlighted_features.length}</span> features highlighted
                </div>
              )}
              
              {/* Basic data info for other visualization types */}
              {"data" in viz && !("layer_name" in viz) && (
                <div className="text-muted-foreground mt-1 truncate">
                  {typeof viz.data === "object" && viz.data.features
                    ? `${viz.data.features.length} features`
                    : "Data layer"}
                </div>
              )}
              
              <div className="mt-2 text-muted-foreground">
                Map visualization ready for display
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderDataInsights = () => {
    if (!message.metadata?.dataInsights) return null;

    return (
      <div className="mt-3">
        <div className="text-xs font-medium text-muted-foreground flex items-center gap-1 mb-2">
          <BarChart3 className="h-3 w-3" />
          Data Insights
        </div>
        <div className="bg-muted/30 rounded-lg p-3 text-xs">
          <div className="font-medium mb-1">
            {message.metadata.dataInsights.summary}
          </div>
          {message.metadata.dataInsights.statistics && (
            <div className="space-y-1">
              {Object.entries(message.metadata.dataInsights.statistics).map(
                ([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-muted-foreground">{key}:</span>
                    <span className="font-mono">{String(value)}</span>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`flex gap-2 sm:gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${
          isUser ? "bg-primary text-primary-foreground" : "bg-muted"
        }`}
      >
        {isUser ? <User className="h-3 w-3 sm:h-4 sm:w-4" /> : <Bot className="h-3 w-3 sm:h-4 sm:w-4" />}
      </div>

      {/* Message Content */}
      <div
        className={`flex-1 max-w-[85%] sm:max-w-[80%] ${isUser ? "text-right" : "text-left"}`}
      >
        <div
          className={`inline-block p-2 sm:p-3 rounded-lg ${
            isUser ? "bg-primary text-primary-foreground" : "bg-muted border"
          }`}
        >
          <div className="text-sm whitespace-pre-wrap break-words">
            {message.content}
            {isStreaming && (
              <Loader2 className="inline h-3 w-3 animate-spin ml-1" />
            )}
          </div>

          {/* Render additional content for assistant messages */}
          {!isUser && (
            <>
              {renderVisualizationPreview()}
              {renderDataInsights()}
            </>
          )}
        </div>

        {/* Timestamp */}
        <div
          className={`text-xs text-muted-foreground mt-1 ${
            isUser ? "text-right" : "text-left"
          }`}
        >
          {formatTimestamp(message.created_at)}
          {message.metadata?.analysisType && !isUser && (
            <span className="ml-2 bg-muted px-2 py-0.5 rounded text-xs hidden sm:inline">
              {message.metadata.analysisType}
            </span>
          )}
        </div>
      </div>
    </div>
  );
});

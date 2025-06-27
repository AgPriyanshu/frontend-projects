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
      <div className="mt-3 space-y-2">
        <div className="text-xs font-medium text-muted-foreground flex items-center gap-1">
          <Eye className="h-3 w-3" />
          Visualizations Generated
        </div>
        <div className="grid grid-cols-2 gap-2">
          {message.metadata.visualizations.map((viz, index) => (
            <div
              key={index}
              className="bg-muted/50 rounded-lg p-2 text-xs border"
            >
              <div className="flex items-center gap-1 font-medium">
                <Map className="h-3 w-3" />
                {viz.type.charAt(0).toUpperCase() + viz.type.slice(1)}
              </div>
              <div className="text-muted-foreground mt-1">
                {typeof viz.data === "object" && viz.data.features
                  ? `${viz.data.features.length} features`
                  : "Data layer"}
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
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser ? "bg-primary text-primary-foreground" : "bg-muted"
        }`}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      {/* Message Content */}
      <div
        className={`flex-1 max-w-[80%] ${isUser ? "text-right" : "text-left"}`}
      >
        <div
          className={`inline-block p-3 rounded-lg ${
            isUser ? "bg-primary text-primary-foreground" : "bg-muted border"
          }`}
        >
          <div className="text-sm whitespace-pre-wrap">
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
            <span className="ml-2 bg-muted px-2 py-0.5 rounded text-xs">
              {message.metadata.analysisType}
            </span>
          )}
        </div>
      </div>
    </div>
  );
});

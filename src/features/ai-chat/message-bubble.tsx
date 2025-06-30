import { memo } from "react";
import { User, Bot, Loader2, Eye, BarChart3, Map } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
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
    <div className={`chat-message ${isUser ? "chat-message--user" : "chat-message--assistant"}`}>
      {/* Avatar */}
      <div className={`chat-message__avatar ${isUser ? "chat-message__avatar--user" : "chat-message__avatar--assistant"}`}>
        {isUser ? <User className="chat-message__avatar-icon" /> : <Bot className="chat-message__avatar-icon" />}
      </div>

      {/* Message Content */}
      <div className="chat-message__bubble">
        <div className="chat-message__content">
          <div className="chat-message__markdown">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              components={{
                // Custom styling for different markdown elements
                h1: ({ children }) => <h1 className="text-lg font-bold mb-2 text-foreground">{children}</h1>,
                h2: ({ children }) => <h2 className="text-base font-semibold mb-2 text-foreground">{children}</h2>,
                h3: ({ children }) => <h3 className="text-sm font-semibold mb-1 text-foreground">{children}</h3>,
                h4: ({ children }) => <h4 className="text-sm font-medium mb-1 text-foreground">{children}</h4>,
                p: ({ children }) => <p className="mb-2 text-foreground">{children}</p>,
                ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                li: ({ children }) => <li className="text-foreground">{children}</li>,
                table: ({ children }) => (
                  <div className="overflow-x-auto mb-3">
                    <table className="min-w-full border-collapse border border-border">
                      {children}
                    </table>
                  </div>
                ),
                thead: ({ children }) => <thead className="bg-muted">{children}</thead>,
                tbody: ({ children }) => <tbody>{children}</tbody>,
                tr: ({ children }) => <tr className="border-b border-border">{children}</tr>,
                th: ({ children }) => <th className="border border-border px-3 py-2 text-left font-medium text-sm">{children}</th>,
                td: ({ children }) => <td className="border border-border px-3 py-2 text-sm">{children}</td>,
                code: ({ children, className }) => {
                  const isInline = !className;
                  if (isInline) {
                    return <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">{children}</code>;
                  }
                  return (
                    <pre className="bg-muted p-3 rounded-lg overflow-x-auto mb-3">
                      <code className="text-xs">{children}</code>
                    </pre>
                  );
                },
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground mb-2">
                    {children}
                  </blockquote>
                ),
                hr: () => <hr className="border-border my-3" />,
                strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                em: ({ children }) => <em className="italic">{children}</em>,
              }}
            >
              {message.content}
            </ReactMarkdown>
            {isStreaming && (
              <Loader2 className="chat-message__loader" />
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
        <div className="chat-message__timestamp">
          {formatTimestamp(message.created_at)}
          {message.metadata?.analysisType && !isUser && (
            <span className="chat-message__analysis-type">
              {message.metadata.analysisType}
            </span>
          )}
        </div>
      </div>
    </div>
  );
});

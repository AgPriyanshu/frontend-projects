import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useChat } from "./chat-context";
import { MessageBubble } from "./message-bubble";
import { AnalysisTools } from "./analysis-tools";
import { Send, Bot, Loader2, MapPin, Trash2, Download } from "lucide-react";

interface ChatInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export function ChatInterface({
  isOpen,
  onClose,
  className,
}: ChatInterfaceProps) {
  const { state, sendMessage, streamMessage, clearMessages } = useChat();
  const [inputMessage, setInputMessage] = useState("");
  const [selectedAnalysisType, setSelectedAnalysisType] =
    useState<string>("spatial");
  const [useStreaming, setUseStreaming] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [state.messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || state.isLoading || state.isStreaming) return;

    const message = inputMessage.trim();
    setInputMessage("");

    // Get current geospatial context when sending message
    // Note: We'll implement this differently to avoid the hook call issue

    try {
      if (useStreaming) {
        await streamMessage(message, selectedAnalysisType);
      } else {
        await sendMessage(message, selectedAnalysisType);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    if (window.confirm("Are you sure you want to clear the chat history?")) {
      clearMessages();
    }
  };

  const handleExportChat = () => {
    const chatData = {
      messages: state.messages,
      timestamp: new Date().toISOString(),
      geospatialContext: state.geospatialContext,
    };

    const blob = new Blob([JSON.stringify(chatData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `geospatial-chat-${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <Card
      className={`fixed right-4 top-4 bottom-4 w-96 flex flex-col shadow-2xl z-50 ${className}`}
    >
      <CardHeader className="pb-2 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">AI Geospatial Assistant</CardTitle>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExportChat}
              title="Export chat"
              disabled={state.messages.length === 0}
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearChat}
              title="Clear chat"
              disabled={state.messages.length === 0}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          </div>
        </div>

        {/* Context Indicator */}
        {state.geospatialContext && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
            <MapPin className="h-3 w-3" />
            <span>
              {state.geospatialContext.features.length} features • Zoom:{" "}
              {state.geospatialContext.zoomLevel}
            </span>
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Analysis Tools */}
        <div className="p-3 border-b bg-muted/50">
          <AnalysisTools
            selectedType={selectedAnalysisType}
            onTypeChange={setSelectedAnalysisType}
            useStreaming={useStreaming}
            onStreamingChange={setUseStreaming}
          />
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {state.messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <Bot className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Ask me to analyze your geospatial data!</p>
              <p className="text-xs mt-1">
                Draw shapes on the map and ask questions about patterns,
                distances, or relationships.
              </p>
            </div>
          ) : (
            state.messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))
          )}

          {state.error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
              <p className="text-sm text-destructive">{state.error}</p>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-3 border-t">
          <div className="flex items-center gap-2">
            <Input
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about your geospatial data..."
              disabled={state.isLoading || state.isStreaming}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={
                !inputMessage.trim() || state.isLoading || state.isStreaming
              }
              size="sm"
            >
              {state.isLoading || state.isStreaming ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>

          {(state.isLoading || state.isStreaming) && (
            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>
                {state.isStreaming ? "Streaming response..." : "Analyzing..."}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

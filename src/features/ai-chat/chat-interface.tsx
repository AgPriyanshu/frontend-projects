import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Badge } from "@/components/ui/badge";
import { useChat } from "./chat-context";
import { MessageBubble } from "./message-bubble";
import { AnalysisTools } from "./analysis-tools";
import { 
  Send, 
  Bot, 
  Loader2, 
  MapPin, 
  Trash2, 
  Download, 
  Plus,
  Wifi,
  WifiOff,
  Settings,
  Zap
} from "lucide-react";

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
  const { 
    state, 
    createSession,
    loadSession,
    sendMessage,
    sendMessageWebSocket,
    clearMessages,
    connectWebSocket,
    disconnectWebSocket,
  } = useChat();
  
  const [inputMessage, setInputMessage] = useState("");
  const [selectedAnalysisType, setSelectedAnalysisType] = useState<string>("spatial");
  const [useWebSocket, setUseWebSocket] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
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

  // Auto-connect WebSocket when session changes
  useEffect(() => {
    if (state.currentSession && useWebSocket) {
      connectWebSocket(state.currentSession.id);
    } else {
      disconnectWebSocket();
    }
    
    return () => {
      disconnectWebSocket();
    };
  }, [state.currentSession?.id, useWebSocket, connectWebSocket, disconnectWebSocket]);

  const handleCreateSession = async () => {
    try {
      const session = await createSession();
      if (useWebSocket) {
        connectWebSocket(session.id);
      }
    } catch (error) {
      console.error("Failed to create session:", error);
    }
  };

  const handleSelectSession = async (sessionId: string) => {
    try {
      await loadSession(sessionId);
    } catch (error) {
      console.error("Failed to load session:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || state.isLoading || state.isStreaming) return;
    if (!state.currentSession) {
      await handleCreateSession();
      return;
    }

    const message = inputMessage.trim();
    setInputMessage("");

    try {
      if (useWebSocket && state.isConnected) {
        sendMessageWebSocket(message);
      } else {
        await sendMessage(message);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleTyping = () => {
    // Implement typing indicator logic here if needed
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
      session: state.currentSession,
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
    a.download = `ai-chat-${state.currentSession?.title || 'session'}-${
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
            <CardTitle className="text-lg">AI Chat</CardTitle>
            {useWebSocket && (
              <span className={`text-xs px-2 py-1 rounded-full ${state.isConnected ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                {state.isConnected ? (
                  <><Wifi className="h-3 w-3 mr-1 inline" />Live</>
                ) : (
                  <><WifiOff className="h-3 w-3 mr-1 inline" />Offline</>
                )}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
              title="Settings"
            >
              <Settings className="h-4 w-4" />
            </Button>
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

        {/* Session Selection */}
        <div className="flex items-center gap-2 mt-2">
          <select
            className="flex-1 px-3 py-2 border border-input bg-background rounded-md"
            value={state.currentSession?.id || ""}
            onChange={(e) => e.target.value && handleSelectSession(e.target.value)}
          >
            <option value="">Select session</option>
            {(state.sessions || []).map((session) => (
              <option key={session.id} value={session.id}>
                {session.title} ({session.message_count} messages)
              </option>
            ))}
          </select>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCreateSession}
            disabled={state.isLoading}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="mt-2 p-2 bg-muted rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Use WebSocket</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setUseWebSocket(!useWebSocket)}
              >
                {useWebSocket ? <Zap className="h-4 w-4" /> : <Wifi className="h-4 w-4" />}
              </Button>
            </div>
            {state.currentSession && (
              <div className="text-xs text-muted-foreground">
                Model: {state.currentSession.model_name} | 
                Temp: {state.currentSession.temperature} | 
                Tools: {state.currentSession.enable_tools ? 'On' : 'Off'}
              </div>
            )}
          </div>
        )}

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
            useStreaming={useWebSocket}
            onStreamingChange={setUseWebSocket}
          />
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {state.messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <Bot className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Start a conversation with AI!</p>
              <p className="text-xs mt-1">
                {state.currentSession 
                  ? "Ask questions about your data or request analysis."
                  : "Create a new session to begin chatting."
                }
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
              onChange={(e) => {
                setInputMessage(e.target.value);
                handleTyping();
              }}
              onKeyPress={handleKeyPress}
              placeholder={
                state.currentSession 
                  ? "Type your message..." 
                  : "Create a session to start chatting..."
              }
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

          {/* Status Indicator */}
          {(state.isLoading || state.isStreaming) && (
            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>
                {state.isStreaming ? "AI is responding..." : "Processing..."}
              </span>
            </div>
          )}
          
          {useWebSocket && !state.isConnected && state.currentSession && (
            <div className="flex items-center gap-2 mt-2 text-xs text-amber-600">
              <WifiOff className="h-3 w-3" />
              <span>Reconnecting...</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

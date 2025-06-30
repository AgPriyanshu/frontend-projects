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
      className={`
        fixed z-50 shadow-2xl flex flex-col
        /* Mobile: Full screen */
        inset-0 w-full h-full
        /* Tablet and up: Windowed chat */
        md:right-4 md:top-4 md:bottom-4 md:left-auto md:w-96 md:max-w-[calc(100vw-2rem)]
        /* Large screens: Wider chat */
        lg:w-[28rem] xl:w-[32rem]
        ${className}
      `}
    >
      <CardHeader className="pb-2 border-b shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Bot className="h-5 w-5 text-primary shrink-0" />
            <CardTitle className="text-lg truncate">AI Chat</CardTitle>
            {useWebSocket && (
              <span className={`hidden sm:inline-flex text-xs px-2 py-1 rounded-full ${state.isConnected ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                {state.isConnected ? (
                  <><Wifi className="h-3 w-3 mr-1 inline" />Live</>
                ) : (
                  <><WifiOff className="h-3 w-3 mr-1 inline" />Offline</>
                )}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
              title="Settings"
              className="hidden sm:inline-flex"
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExportChat}
              title="Export chat"
              disabled={state.messages.length === 0}
              className="hidden sm:inline-flex"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearChat}
              title="Clear chat"
              disabled={state.messages.length === 0}
              className="hidden sm:inline-flex"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
              title="Menu"
              className="sm:hidden"
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          </div>
        </div>

        {/* Session Selection */}
        <div className="flex items-center gap-2 mt-2">
          <select
            className="flex-1 px-3 py-2 border border-input bg-background rounded-md text-sm"
            value={state.currentSession?.id || ""}
            onChange={(e) => e.target.value && handleSelectSession(e.target.value)}
          >
            <option value="">Select session</option>
            {(state.sessions || []).map((session) => (
              <option key={session.id} value={session.id}>
                <span className="sm:hidden">{session.title}</span>
                <span className="hidden sm:inline">{session.title} ({session.message_count} messages)</span>
              </option>
            ))}
          </select>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCreateSession}
            disabled={state.isLoading}
            className="shrink-0"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Settings Panel - Mobile responsive */}
        {showSettings && (
          <div className="mt-2 p-3 bg-muted rounded-lg space-y-3">
            {/* Mobile: Show all controls */}
            <div className="sm:hidden space-y-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleExportChat}
                disabled={state.messages.length === 0}
                className="w-full justify-start"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Chat
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearChat}
                disabled={state.messages.length === 0}
                className="w-full justify-start"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Chat
              </Button>
            </div>
            
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
                <div className="sm:hidden space-y-1">
                  <div>Model: {state.currentSession.model_name}</div>
                  <div>Temperature: {state.currentSession.temperature}</div>
                  <div>Tools: {state.currentSession.enable_tools ? 'On' : 'Off'}</div>
                </div>
                <div className="hidden sm:block">
                  Model: {state.currentSession.model_name} | 
                  Temp: {state.currentSession.temperature} | 
                  Tools: {state.currentSession.enable_tools ? 'On' : 'Off'}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Context Indicator */}
        {state.geospatialContext && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">
              {state.geospatialContext.features.length} features • Zoom:{" "}
              {state.geospatialContext.zoomLevel}
            </span>
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 min-h-0">
        {/* Analysis Tools */}
        <div className="p-3 border-b bg-muted/50 shrink-0">
          <AnalysisTools
            selectedType={selectedAnalysisType}
            onTypeChange={setSelectedAnalysisType}
            useStreaming={useWebSocket}
            onStreamingChange={setUseWebSocket}
          />
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
          {state.messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <Bot className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Start a conversation with AI!</p>
              <p className="text-xs mt-1 px-4">
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
              <p className="text-sm text-destructive break-words">{state.error}</p>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-3 border-t shrink-0 bg-background">
          <div className="flex items-end gap-2">
            <div className="flex-1">
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
                className="min-h-[2.5rem] resize-none"
              />
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={
                !inputMessage.trim() || state.isLoading || state.isStreaming
              }
              size="sm"
              className="h-10 w-10 shrink-0"
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

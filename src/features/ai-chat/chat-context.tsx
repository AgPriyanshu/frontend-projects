import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useRef,
  useEffect,
} from "react";
import type { ReactNode } from "react";
import { aiChatApi, WebSocketManager } from "./api";
import type {
  ChatMessage,
  ChatState,
  ChatSession,
  GeospatialContext,
  AnalysisResult,
  LLMModel,
  ChatPreset,
  WebSocketResponse,
} from "./types";

interface ChatContextType {
  state: ChatState;
  // Session management
  createSession: (title?: string, systemPrompt?: string) => Promise<ChatSession>;
  loadSession: (sessionId: string) => Promise<void>;
  getSessions: () => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  // Message handling
  sendMessage: (message: string) => Promise<void>;
  sendMessageWebSocket: (message: string) => void;
  // Context and state management
  updateGeospatialContext: (context: GeospatialContext) => void;
  clearMessages: () => void;
  applyAnalysisToMap: (analysis: AnalysisResult) => void;
  // WebSocket management
  connectWebSocket: (sessionId: string) => void;
  disconnectWebSocket: () => void;
  // Model and preset management
  loadModels: () => Promise<void>;
  loadPresets: () => Promise<void>;
  syncModels: () => Promise<void>;
}

const ChatContext = createContext<ChatContextType | null>(null);

type ChatAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_STREAMING"; payload: boolean }
  | { type: "SET_CONNECTED"; payload: boolean }
  | { type: "ADD_MESSAGE"; payload: ChatMessage }
  | { type: "SET_MESSAGES"; payload: ChatMessage[] }
  | { type: "SET_SESSIONS"; payload: ChatSession[] }
  | { type: "SET_CURRENT_SESSION"; payload: ChatSession | null }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_GEOSPATIAL_CONTEXT"; payload: GeospatialContext | null }
  | { type: "SET_MODELS"; payload: LLMModel[] }
  | { type: "SET_PRESETS"; payload: ChatPreset[] }
  | { type: "CLEAR_MESSAGES" };

const initialState: ChatState = {
  messages: [],
  sessions: [],
  currentSession: null,
  isLoading: false,
  isStreaming: false,
  isConnected: false,
  geospatialContext: null,
  availableModels: [],
  availablePresets: [],
  error: null,
};

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_STREAMING":
      return { ...state, isStreaming: action.payload };
    case "SET_CONNECTED":
      return { ...state, isConnected: action.payload };
    case "ADD_MESSAGE":
      return { ...state, messages: [...state.messages, action.payload] };
    case "SET_MESSAGES":
      return { ...state, messages: action.payload };
    case "SET_SESSIONS":
      return { ...state, sessions: action.payload };
    case "SET_CURRENT_SESSION":
      return { ...state, currentSession: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "SET_GEOSPATIAL_CONTEXT":
      return { ...state, geospatialContext: action.payload };
    case "SET_MODELS":
      return { ...state, availableModels: action.payload };
    case "SET_PRESETS":
      return { ...state, availablePresets: action.payload };
    case "CLEAR_MESSAGES":
      return { ...state, messages: [] };
    default:
      return state;
  }
}

interface ChatProviderProps {
  children: ReactNode;
  onMapUpdate?: (analysis: AnalysisResult) => void;
}

export function ChatProvider({ children, onMapUpdate }: ChatProviderProps) {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const contextRef = useRef<GeospatialContext | null>(null);
  const wsManagerRef = useRef<WebSocketManager | null>(null);

  // Session management
  const createSession = useCallback(async (title?: string, systemPrompt?: string): Promise<ChatSession> => {
    dispatch({ type: "SET_LOADING", payload: true });
    dispatch({ type: "SET_ERROR", payload: null });

    try {
      const session = await aiChatApi.createSession({
        title: title || "New AI Chat",
        system_prompt: systemPrompt,
      });
      
      dispatch({ type: "SET_CURRENT_SESSION", payload: session });
      dispatch({ type: "SET_MESSAGES", payload: session.messages || [] });
      
      // Refresh sessions list
      await getSessions();
      
      return session;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create session";
      dispatch({ type: "SET_ERROR", payload: errorMessage });
      throw error;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, []);

  const loadSession = useCallback(async (sessionId: string) => {
    dispatch({ type: "SET_LOADING", payload: true });
    dispatch({ type: "SET_ERROR", payload: null });

    try {
      const session = await aiChatApi.getSession(sessionId);
      const messagesData = await aiChatApi.getMessages(sessionId);
      
      dispatch({ type: "SET_CURRENT_SESSION", payload: session });
      dispatch({ type: "SET_MESSAGES", payload: messagesData.messages });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to load session";
      dispatch({ type: "SET_ERROR", payload: errorMessage });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, []);

  const getSessions = useCallback(async () => {
    try {
      const response = await aiChatApi.getSessions();
      // Ensure we always get an array, even if the API returns something else
      const sessions = Array.isArray(response) ? response : [];
      dispatch({ type: "SET_SESSIONS", payload: sessions });
    } catch (error) {
      console.error("Failed to load sessions:", error);
      // Set empty array on error to prevent map errors
      dispatch({ type: "SET_SESSIONS", payload: [] });
    }
  }, []);

  const deleteSession = useCallback(async (sessionId: string) => {
    try {
      await aiChatApi.deleteSession(sessionId);
      await getSessions(); // Refresh sessions list
      
      // If deleted session was current, clear it
      if (state.currentSession?.id === sessionId) {
        dispatch({ type: "SET_CURRENT_SESSION", payload: null });
        dispatch({ type: "SET_MESSAGES", payload: [] });
        disconnectWebSocket();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to delete session";
      dispatch({ type: "SET_ERROR", payload: errorMessage });
    }
  }, [state.currentSession?.id]);

  // WebSocket management
  const connectWebSocket = useCallback((sessionId: string) => {
    // Disconnect existing connection
    if (wsManagerRef.current) {
      wsManagerRef.current.disconnect();
    }

    // Create new WebSocket manager
    wsManagerRef.current = new WebSocketManager(sessionId, {
      onConnect: () => {
        dispatch({ type: "SET_CONNECTED", payload: true });
        dispatch({ type: "SET_ERROR", payload: null });
      },
      onDisconnect: () => {
        dispatch({ type: "SET_CONNECTED", payload: false });
      },
      onMessage: (data: WebSocketResponse) => {
        handleWebSocketMessage(data);
      },
      onError: (error) => {
        console.error("WebSocket error:", error);
        dispatch({ type: "SET_ERROR", payload: "Connection error" });
        dispatch({ type: "SET_CONNECTED", payload: false });
      },
    });

    wsManagerRef.current.connect();
  }, []);

  const disconnectWebSocket = useCallback(() => {
    if (wsManagerRef.current) {
      wsManagerRef.current.disconnect();
      wsManagerRef.current = null;
    }
    dispatch({ type: "SET_CONNECTED", payload: false });
  }, []);

  // Handle WebSocket messages
  const handleWebSocketMessage = useCallback((data: WebSocketResponse) => {
    switch (data.type) {
      case 'connection_established':
        break;
      
      case 'user_message':
      case 'ai_message_complete':
        if (data.message && typeof data.message === 'object') {
          dispatch({ type: "ADD_MESSAGE", payload: data.message as ChatMessage });
        }
        break;
      
      case 'ai_typing':
        dispatch({ type: "SET_STREAMING", payload: true });
        break;
      
      case 'ai_message_chunk':
        dispatch({ type: "SET_STREAMING", payload: true });
        break;
      
      case 'error':
        dispatch({ type: "SET_ERROR", payload: data.message as string });
        dispatch({ type: "SET_STREAMING", payload: false });
        break;
    }
  }, []);

  // Message handling
  const sendMessage = useCallback(async (message: string) => {
    if (!state.currentSession) {
      dispatch({ type: "SET_ERROR", payload: "No active session" });
      return;
    }

    dispatch({ type: "SET_LOADING", payload: true });
    dispatch({ type: "SET_ERROR", payload: null });

    try {
      // Send via HTTP API
      const response = await aiChatApi.sendMessage(state.currentSession.id, {
        message,
        stream: false,
      });

      if (response.success) {
        // Add user message if provided
        if (response.user_message) {
          const userMessage: ChatMessage = {
            id: response.user_message.id,
            role: "user",
            content: response.user_message.content,
            created_at: response.user_message.created_at,
            metadata: {
              geospatialData: state.geospatialContext,
            },
          };
          dispatch({ type: "ADD_MESSAGE", payload: userMessage });
        }

        // Add AI message if provided
        if (response.ai_message) {
          const aiMessage: ChatMessage = {
            id: response.ai_message.id,
            role: "assistant",
            content: response.ai_message.content,
            created_at: response.ai_message.created_at,
            metadata: {},
          };
          dispatch({ type: "ADD_MESSAGE", payload: aiMessage });
        }
      } else {
        dispatch({ type: "SET_ERROR", payload: response.error || "Failed to send message" });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to send message";
      dispatch({ type: "SET_ERROR", payload: errorMessage });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [state.currentSession, state.geospatialContext]);

  const sendMessageWebSocket = useCallback((message: string) => {
    if (!wsManagerRef.current || !wsManagerRef.current.isConnected()) {
      dispatch({ type: "SET_ERROR", payload: "Not connected to chat" });
      return;
    }

    // Send via WebSocket for real-time experience
    wsManagerRef.current.sendMessage(message);
  }, []);

  // Model and preset management
  const loadModels = useCallback(async () => {
    try {
      const models = await aiChatApi.getModels();
      dispatch({ type: "SET_MODELS", payload: models });
    } catch (error) {
      console.error("Failed to load models:", error);
    }
  }, []);

  const loadPresets = useCallback(async () => {
    try {
      const presets = await aiChatApi.getPresets();
      dispatch({ type: "SET_PRESETS", payload: presets });
    } catch (error) {
      console.error("Failed to load presets:", error);
    }
  }, []);

  const syncModels = useCallback(async () => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const result = await aiChatApi.syncModels();
      dispatch({ type: "SET_MODELS", payload: result.models });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to sync models";
      dispatch({ type: "SET_ERROR", payload: errorMessage });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, []);

  // Context management
  const updateGeospatialContext = useCallback((context: GeospatialContext) => {
    const hasChanged =
      !contextRef.current ||
      contextRef.current.features.length !== context.features.length ||
      contextRef.current.zoomLevel !== context.zoomLevel ||
      JSON.stringify(contextRef.current.bounds) !== JSON.stringify(context.bounds);

    if (hasChanged) {
      contextRef.current = context;
      dispatch({ type: "SET_GEOSPATIAL_CONTEXT", payload: context });
    }
  }, []);

  const clearMessages = useCallback(() => {
    dispatch({ type: "CLEAR_MESSAGES" });
  }, []);

  const applyAnalysisToMap = useCallback(
    (analysis: AnalysisResult) => {
      if (onMapUpdate) {
        onMapUpdate(analysis);
      }
    },
    [onMapUpdate]
  );

  // Initialize data on mount
  useEffect(() => {
    loadModels();
    loadPresets();
    getSessions();
  }, [loadModels, loadPresets, getSessions]);

  // Cleanup WebSocket on unmount
  useEffect(() => {
    return () => {
      disconnectWebSocket();
    };
  }, [disconnectWebSocket]);

  const contextValue: ChatContextType = {
    state,
    createSession,
    loadSession,
    getSessions,
    deleteSession,
    sendMessage,
    sendMessageWebSocket,
    updateGeospatialContext,
    clearMessages,
    applyAnalysisToMap,
    connectWebSocket,
    disconnectWebSocket,
    loadModels,
    loadPresets,
    syncModels,
  };

  return (
    <ChatContext.Provider value={contextValue}>{children}</ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useRef,
} from "react";
import type { ReactNode } from "react";
import { aiChatApi } from "@/api";
import type {
  ChatMessage,
  ChatState,
  GeospatialContext,
  AnalysisResult,
} from "./types";

interface ChatContextType {
  state: ChatState;
  sendMessage: (message: string, analysisType?: string) => Promise<void>;
  streamMessage: (message: string, analysisType?: string) => Promise<void>;
  updateGeospatialContext: (context: GeospatialContext) => void;
  clearMessages: () => void;
  loadChatHistory: (sessionId?: string) => Promise<void>;
  applyAnalysisToMap: (analysis: AnalysisResult) => void;
}

const ChatContext = createContext<ChatContextType | null>(null);

type ChatAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_STREAMING"; payload: boolean }
  | { type: "ADD_MESSAGE"; payload: ChatMessage }
  | { type: "UPDATE_MESSAGE"; payload: { id: string; content: string } }
  | { type: "SET_MESSAGES"; payload: ChatMessage[] }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_GEOSPATIAL_CONTEXT"; payload: GeospatialContext | null }
  | { type: "SET_AVAILABLE_TOOLS"; payload: any[] }
  | { type: "SET_SESSION_ID"; payload: string | null }
  | { type: "CLEAR_MESSAGES" };

const initialState: ChatState = {
  messages: [],
  isLoading: false,
  isStreaming: false,
  currentSessionId: null,
  geospatialContext: null,
  availableTools: [],
  error: null,
};

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_STREAMING":
      return { ...state, isStreaming: action.payload };
    case "ADD_MESSAGE":
      return { ...state, messages: [...state.messages, action.payload] };
    case "UPDATE_MESSAGE":
      return {
        ...state,
        messages: state.messages.map((msg) =>
          msg.id === action.payload.id
            ? { ...msg, content: action.payload.content, isStreaming: false }
            : msg
        ),
      };
    case "SET_MESSAGES":
      return { ...state, messages: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "SET_GEOSPATIAL_CONTEXT":
      return { ...state, geospatialContext: action.payload };
    case "SET_AVAILABLE_TOOLS":
      return { ...state, availableTools: action.payload };
    case "SET_SESSION_ID":
      return { ...state, currentSessionId: action.payload };
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

  const sendMessage = useCallback(
    async (message: string, analysisType?: string) => {
      dispatch({ type: "SET_LOADING", payload: true });
      dispatch({ type: "SET_ERROR", payload: null });

      // Add user message
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "user",
        content: message,
        timestamp: new Date(),
      };
      dispatch({ type: "ADD_MESSAGE", payload: userMessage });

      try {
        const response = await aiChatApi.sendMessage({
          query: message,
          features: state.geospatialContext?.features || [],
          bounds: state.geospatialContext?.bounds,
          analysisType: analysisType as any,
          context: `Map center: ${state.geospatialContext?.mapCenter}, Zoom: ${state.geospatialContext?.zoomLevel}`,
        });

        // Add assistant response
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: response.analysis,
          timestamp: new Date(),
          metadata: {
            visualizations: response.visualizations,
            dataInsights: response.dataInsights,
            geospatialData: response,
          },
        };
        dispatch({ type: "ADD_MESSAGE", payload: assistantMessage });

        // Apply analysis to map if callback provided
        if (onMapUpdate && response.visualizations) {
          onMapUpdate({
            type: (analysisType as any) || "spatial",
            summary: response.analysis,
            details: response.dataInsights,
            visualizations: response.visualizations,
            recommendations: response.suggestions,
          });
        }
      } catch (error) {
        dispatch({
          type: "SET_ERROR",
          payload: error instanceof Error ? error.message : "Unknown error",
        });
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    },
    [state.geospatialContext, onMapUpdate]
  );

  const streamMessage = useCallback(
    async (message: string, analysisType?: string) => {
      dispatch({ type: "SET_STREAMING", payload: true });
      dispatch({ type: "SET_ERROR", payload: null });

      // Add user message
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "user",
        content: message,
        timestamp: new Date(),
      };
      dispatch({ type: "ADD_MESSAGE", payload: userMessage });

      // Add streaming assistant message
      const assistantMessageId = (Date.now() + 1).toString();
      const assistantMessage: ChatMessage = {
        id: assistantMessageId,
        role: "assistant",
        content: "",
        timestamp: new Date(),
        isStreaming: true,
      };
      dispatch({ type: "ADD_MESSAGE", payload: assistantMessage });

      try {
        const stream = aiChatApi.streamMessage({
          query: message,
          features: state.geospatialContext?.features || [],
          bounds: state.geospatialContext?.bounds,
          analysisType: analysisType as any,
          context: `Map center: ${state.geospatialContext?.mapCenter}, Zoom: ${state.geospatialContext?.zoomLevel}`,
        });

        let fullContent = "";
        for await (const chunk of stream) {
          fullContent += chunk;
          dispatch({
            type: "UPDATE_MESSAGE",
            payload: { id: assistantMessageId, content: fullContent },
          });
        }
      } catch (error) {
        dispatch({
          type: "SET_ERROR",
          payload: error instanceof Error ? error.message : "Unknown error",
        });
      } finally {
        dispatch({ type: "SET_STREAMING", payload: false });
      }
    },
    [state.geospatialContext]
  );

  const updateGeospatialContext = useCallback((context: GeospatialContext) => {
    // Only update if the context has actually changed to prevent unnecessary updates
    const hasChanged =
      !contextRef.current ||
      contextRef.current.features.length !== context.features.length ||
      contextRef.current.zoomLevel !== context.zoomLevel ||
      JSON.stringify(contextRef.current.bounds) !==
        JSON.stringify(context.bounds);

    if (hasChanged) {
      contextRef.current = context;
      dispatch({ type: "SET_GEOSPATIAL_CONTEXT", payload: context });
    }
  }, []);

  const clearMessages = useCallback(() => {
    dispatch({ type: "CLEAR_MESSAGES" });
  }, []);

  const loadChatHistory = useCallback(async (sessionId?: string) => {
    try {
      const messages = await aiChatApi.getChatHistory(sessionId);
      dispatch({ type: "SET_MESSAGES", payload: messages });
      if (sessionId) {
        dispatch({ type: "SET_SESSION_ID", payload: sessionId });
      }
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload:
          error instanceof Error
            ? error.message
            : "Failed to load chat history",
      });
    }
  }, []);

  const applyAnalysisToMap = useCallback(
    (analysis: AnalysisResult) => {
      if (onMapUpdate) {
        onMapUpdate(analysis);
      }
    },
    [onMapUpdate]
  );

  const contextValue: ChatContextType = {
    state,
    sendMessage,
    streamMessage,
    updateGeospatialContext,
    clearMessages,
    loadChatHistory,
    applyAnalysisToMap,
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

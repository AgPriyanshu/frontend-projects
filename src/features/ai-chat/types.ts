export interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
}

export interface ChatSession {
  id: string;
  user?: User;
  title: string;
  model_name: string;
  temperature: number;
  max_tokens: number | null;
  enable_tools: boolean;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  messages?: ChatMessage[];
  message_count: number;
  last_message_time: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  tool_calls?: any;
  tool_call_id?: string;
  metadata?: {
    geospatialData?: any;
    analysisType?: string;
    mapBounds?: [number, number, number, number];
    drawnFeatures?: any[];
    visualizations?: Array<{
      type: "heatmap" | "cluster" | "route" | "buffer" | "polygon";
      data: any;
      style?: any;
    }>;
    dataInsights?: {
      summary: string;
      statistics: Record<string, any>;
    };
  };
  created_at: string;
  token_count?: number;
  isStreaming?: boolean;
}

export interface LLMModel {
  id: number;
  name: string;
  display_name: string;
  description: string;
  size?: number;
  parameter_count: string;
  context_length?: number;
  is_available: boolean;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface ChatPreset {
  id: number;
  name: string;
  description: string;
  system_prompt: string;
  model_name: string;
  temperature: number;
  max_tokens: number | null;
  enable_tools: boolean;
  is_public: boolean;
  created_by: User;
  created_at: string;
  updated_at: string;
}

export interface GeospatialContext {
  features: any[]; // GeoJSON features from map drawings
  bounds: [number, number, number, number]; // Map bounds [west, south, east, north]
  mapCenter: [number, number];
  zoomLevel: number;
  visibleLayers?: string[];
  selectedFeatures?: any[];
}

export interface AnalysisResult {
  type:
    | "spatial"
    | "statistical"
    | "pattern"
    | "route"
    | "buffer"
    | "intersection";
  summary: string;
  details: any;
  visualizations?: Array<{
    type: string;
    data: any;
    style?: any;
  }>;
  recommendations?: string[];
}

export interface ChatState {
  messages: ChatMessage[];
  sessions: ChatSession[];
  currentSession: ChatSession | null;
  isLoading: boolean;
  isStreaming: boolean;
  isConnected: boolean;
  geospatialContext: GeospatialContext | null;
  availableModels: LLMModel[];
  availablePresets: ChatPreset[];
  error: string | null;
}

// WebSocket message types
export interface WebSocketMessage {
  type: 'send_message' | 'typing' | 'stop_typing' | 'ping';
  message?: string;
}

export interface WebSocketResponse {
  type: 'connection_established' | 'user_message' | 'ai_typing' | 'ai_message_chunk' | 'ai_message_complete' | 'error' | 'pong';
  message?: ChatMessage | string;
  content?: string;
  full_content?: string;
  session_id?: string;
}

// API request types
export interface CreateSessionRequest {
  title?: string;
  model_name?: string;
  temperature?: number;
  max_tokens?: number;
  enable_tools?: boolean;
  system_prompt?: string;
}

export interface SendMessageRequest {
  message: string;
  stream?: boolean;
}

export interface ChatSessionResponse {
  id: string;
  name: string;
  llm: string;
  createdAt: string;
  updatedAt: string;
}

export type ChatSessionListResponse = ChatSessionResponse[];

export interface CreateChatSessionPayload {
  name: string;
  llm: string | null;
}

export interface LLMResponse {
  id: string;
  name: string;
  modelName: string;
  url: string;
  createdAt: string;
  updatedAt: string;
}

export type LLMListResponse = LLMResponse[];

export interface ChatMessageResponse {
  id: string;
  sessionId: string;
  message: string;
  userId: number;
  role: "user" | "assistant";
}

export interface WebSocketIncomingMessage {
  id: string;
  sessionId: string;
  message: string;
  userId: number;
  role: "user" | "assistant";
  isChunk?: boolean;
}

export interface WebSocketOutgoingMessage {
  message: string;
}

export interface WebSocketErrorMessage {
  error: string;
}

export interface UIAction {
  app: string;
  action_type: string;
  payload: Record<string, unknown>;
}

export interface WebSocketUIActionMessage {
  type: "ui_action";
  sessionId: string;
  actions: UIAction[];
}

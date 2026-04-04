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
  llm: string;
}

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
}

export interface WebSocketOutgoingMessage {
  message: string;
}

export interface WebSocketErrorMessage {
  error: string;
}

import type { MessageRole } from "features/agent-chat/store/constants";
import type { UIActionType } from "./constants";

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
  role: MessageRole;
}

export interface WebSocketIncomingMessage {
  id: string;
  sessionId: string;
  message: string;
  userId: number;
  role: MessageRole;
  isChunk?: boolean;
  uiAction?: UIAction;
}

export interface WebSocketOutgoingMessage {
  message: string;
}

export interface WebSocketErrorMessage {
  error: string;
}

export interface UIAction {
  app: string;
  type: UIActionType;
  payload: Record<string, unknown>;
}

export interface AgentStatusMessage {
  type: "agent_status";
  session_id: string;
  status: string;
}

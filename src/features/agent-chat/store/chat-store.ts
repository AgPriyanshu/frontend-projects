import type {
  ChatMessageResponse,
  WebSocketIncomingMessage,
} from "api/agent-chat/types";
import { makeAutoObservable } from "mobx";
import { MessageRole } from "./constants";
import { ConnectionStatus } from "./types";

export class ChatStore {
  messages: ChatMessageResponse[] = [];
  activeSessionId: string | null = null;
  isPanelOpen = false;
  isSessionListOpen = false;
  isWaitingForResponse = false;
  agentStatus: string | null = null;
  connectionStatus: ConnectionStatus = ConnectionStatus.Disconnected;

  constructor() {
    makeAutoObservable(this);
  }

  togglePanel() {
    this.isPanelOpen = !this.isPanelOpen;
  }

  openPanel() {
    this.isPanelOpen = true;
  }

  closePanel() {
    this.isPanelOpen = false;
  }

  toggleSessionList() {
    this.isSessionListOpen = !this.isSessionListOpen;
  }

  setActiveSession(sessionId: string | null) {
    this.activeSessionId = sessionId;
    this.messages = [];
  }

  loadHistory(messages: ChatMessageResponse[]) {
    // Only load if the store is still empty (no live messages arrived yet).
    if (this.messages.length > 0) {
      return;
    }

    this.messages = messages.filter((m) => !!m.message);
  }

  setConnectionStatus(status: ConnectionStatus) {
    this.connectionStatus = status;
  }

  /**
   * Add an optimistic user message before the server echoes it back.
   * Uses a temporary ID that gets replaced on confirmation.
   */
  addOptimisticMessage(content: string, userId: number): string {
    const tempId = `temp-${Date.now()}`;

    this.messages.push({
      id: tempId,
      sessionId: this.activeSessionId ?? "",
      message: content,
      userId,
      role: "user",
    });

    this.isWaitingForResponse = true;

    return tempId;
  }

  /**
   * Handle an incoming WebSocket message (either user echo or assistant response).
   */
  handleIncomingMessage(incomingMessage: WebSocketIncomingMessage) {
    switch (incomingMessage.role) {
      case MessageRole.User: {
        const optimisticIndex = this.messages.findIndex(
          (message) =>
            message.id.startsWith("temp-") &&
            message.message === incomingMessage.message
        );

        if (optimisticIndex !== -1) {
          this.messages[optimisticIndex] = {
            id: incomingMessage.id,
            sessionId: incomingMessage.sessionId,
            message: incomingMessage.message,
            userId: incomingMessage.userId,
            role: incomingMessage.role,
          };
        }
        break;
      }

      case MessageRole.Assistant: {
        this.isWaitingForResponse = false;
        this.agentStatus = null;
        const existingMessage = this.messages.find(
          (message) => message.id === incomingMessage.id
        );

        if (existingMessage) {
          if (incomingMessage.message) {
            existingMessage.message += incomingMessage.message;
          }
        } else {
          if (incomingMessage.message || !incomingMessage.isChunk) {
            this.messages.push({
              id: incomingMessage.id,
              sessionId: incomingMessage.sessionId,
              message: incomingMessage.message,
              userId: incomingMessage.userId,
              role: incomingMessage.role,
            });
          }
        }

        break;
      }

      default: {
        this.messages.push({
          id: incomingMessage.id,
          sessionId: incomingMessage.sessionId,
          message: incomingMessage.message,
          userId: incomingMessage.userId,
          role: incomingMessage.role,
        });

        break;
      }
    }
  }

  setAgentStatus(status: string | null) {
    this.agentStatus = status;
  }

  stopWaiting() {
    this.isWaitingForResponse = false;
    this.agentStatus = null;
  }

  clearMessages() {
    this.messages = [];
    this.isWaitingForResponse = false;
    this.agentStatus = null;
  }
}

export const chatStore = new ChatStore();

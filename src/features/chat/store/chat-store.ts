import { makeAutoObservable, runInAction } from "mobx";
import type {
  ChatMessageResponse,
  WebSocketIncomingMessage,
} from "api/chat/types";

export type ConnectionStatus = "disconnected" | "connecting" | "connected";

export class ChatStore {
  messages: ChatMessageResponse[] = [];
  activeSessionId: string | null = null;
  isPanelOpen = false;
  isWaitingForResponse = false;
  connectionStatus: ConnectionStatus = "disconnected";

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

  setActiveSession(sessionId: string | null) {
    this.activeSessionId = sessionId;
    this.messages = [];
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
  handleIncomingMessage(data: WebSocketIncomingMessage) {
    runInAction(() => {
      // If this is the server echo of a user message, replace the optimistic one
      if (data.role === "user") {
        const optimisticIndex = this.messages.findIndex(
          (m) => m.id.startsWith("temp-") && m.message === data.message
        );
        if (optimisticIndex !== -1) {
          this.messages[optimisticIndex] = {
            id: data.id,
            sessionId: data.sessionId,
            message: data.message,
            userId: data.userId,
            role: data.role,
          };
          return;
        }
      }

      // For assistant messages, append and stop waiting
      this.messages.push({
        id: data.id,
        sessionId: data.sessionId,
        message: data.message,
        userId: data.userId,
        role: data.role,
      });

      if (data.role === "assistant") {
        this.isWaitingForResponse = false;
      }
    });
  }

  clearMessages() {
    this.messages = [];
    this.isWaitingForResponse = false;
  }
}

export const chatStore = new ChatStore();

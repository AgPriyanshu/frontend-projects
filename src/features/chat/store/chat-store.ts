import { makeAutoObservable, runInAction } from "mobx";
import type {
  ChatMessageResponse,
  UIAction,
  WebSocketIncomingMessage,
} from "api/chat/types";

export type ConnectionStatus = "disconnected" | "connecting" | "connected";

export class ChatStore {
  messages: ChatMessageResponse[] = [];
  activeSessionId: string | null = null;
  isPanelOpen = false;
  isSessionListOpen = false;
  isWaitingForResponse = false;
  connectionStatus: ConnectionStatus = "disconnected";
  pendingUIActions: UIAction[] = [];

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

      // Handle assistant message (chunked or whole)
      if (data.role === "assistant") {
        this.isWaitingForResponse = false;

        const existingMessage = this.messages.find((m) => m.id === data.id);

        if (existingMessage) {
          if (data.message) {
            existingMessage.message += data.message; // Append chunk
          }
        } else {
          // Only push if there's content or it's not a chunk
          if (data.message || !data.isChunk) {
            this.messages.push({
              id: data.id,
              sessionId: data.sessionId,
              message: data.message,
              userId: data.userId,
              role: data.role,
            });
          }
        }
        return;
      }

      // Standard non-chunk append for any other roles
      this.messages.push({
        id: data.id,
        sessionId: data.sessionId,
        message: data.message,
        userId: data.userId,
        role: data.role,
      });
    });
  }

  setPendingUIActions(actions: UIAction[]) {
    this.pendingUIActions = actions;
  }

  clearPendingUIActions() {
    this.pendingUIActions = [];
  }

  clearMessages() {
    this.messages = [];
    this.isWaitingForResponse = false;
  }
}

export const chatStore = new ChatStore();

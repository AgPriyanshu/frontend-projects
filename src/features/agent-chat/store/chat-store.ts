import { makeAutoObservable, runInAction } from "mobx";
import type {
  ChatMessageResponse,
  UIAction,
  WebSocketIncomingMessage,
} from "api/chat/types";
import { queryClient } from "api/query-client";
import { QueryKeys } from "api/query-keys";
import { ConnectionStatus } from "./types";
import { MessageRole } from "./constants";

export class ChatStore {
  messages: ChatMessageResponse[] = [];
  activeSessionId: string | null = null;
  isPanelOpen = false;
  isSessionListOpen = false;
  isWaitingForResponse = false;
  agentStatus: string | null = null;
  connectionStatus: ConnectionStatus = ConnectionStatus.Disconnected;
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

  loadHistory(messages: ChatMessageResponse[]) {
    // Only load if the store is still empty (no live messages arrived yet).
    if (this.messages.length > 0) return;
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
  handleIncomingMessage(data: WebSocketIncomingMessage) {
    runInAction(() => {
      // If this is the server echo of a user message, replace the optimistic one
      if (data.role === MessageRole.User) {
        const optimisticIndex = this.messages.findIndex(
          (message) =>
            message.id.startsWith("temp-") && message.message === data.message
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
      if (data.role === MessageRole.Assistant) {
        this.isWaitingForResponse = false;
        this.agentStatus = null;
        const existingMessage = this.messages.find((m) => m.id === data.id);

        if (existingMessage) {
          if (data.message) {
            existingMessage.message += data.message;
          }
        } else {
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

        if (!data.isChunk) {
          if (data.ui_action) {
            this.setPendingUIActions([data.ui_action]);
          }

          if (this.activeSessionId) {
            queryClient.invalidateQueries({
              queryKey: QueryKeys.chatMessages(this.activeSessionId),
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

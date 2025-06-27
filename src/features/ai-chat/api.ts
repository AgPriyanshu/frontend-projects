import axios from 'axios';
import type {
  ChatSession,
  ChatMessage,
  LLMModel,
  ChatPreset,
  CreateSessionRequest,
  SendMessageRequest,
  WebSocketMessage,
  WebSocketResponse,
} from './types';

// Configuration - can be overridden by environment variables or build process
const config = {
  API_URL: 'http://localhost:8000',
  WS_URL: 'ws://localhost:8000',
};

// Create axios instance with base configuration
const api = axios.create({
  baseURL: config.API_URL,
  timeout: 30000,
});

export class AiChatApi {
  private baseUrl: string;
  private wsUrl: string;

  constructor() {
    this.baseUrl = `${config.API_URL}/ai-chat/api`;
    this.wsUrl = config.WS_URL;  // Just use the base WS URL
  }

  // Session Management
  async createSession(data: CreateSessionRequest): Promise<ChatSession> {
    const response = await api.post('/ai-chat/api/sessions/', data);
    return response.data.data || response.data;
  }

  async getSessions(): Promise<ChatSession[]> {
    const response = await api.get('/ai-chat/api/sessions/');
    return response.data.data || response.data;
  }

  async getSession(sessionId: string): Promise<ChatSession> {
    const response = await api.get(`/ai-chat/api/sessions/${sessionId}/`);
    return response.data.data || response.data;
  }

  async updateSession(sessionId: string, data: Partial<ChatSession>): Promise<ChatSession> {
    const response = await api.patch(`/ai-chat/api/sessions/${sessionId}/`, data);
    return response.data.data || response.data;
  }

  async deleteSession(sessionId: string): Promise<void> {
    await api.delete(`/ai-chat/api/sessions/${sessionId}/`);
  }

  // Message Management
  async sendMessage(sessionId: string, data: SendMessageRequest): Promise<any> {
    const response = await api.post(`/ai-chat/api/sessions/${sessionId}/send_message/`, data);
    return response.data.data || response.data;
  }

  async getMessages(sessionId: string): Promise<{ messages: ChatMessage[]; total_count: number }> {
    const response = await api.get(`/ai-chat/api/sessions/${sessionId}/messages/`);
    const responseData = response.data.data || response.data;
    return {
      messages: responseData.messages || [],
      total_count: responseData.total_count || 0
    };
  }

  // Model Management
  async getModels(): Promise<LLMModel[]> {
    const response = await api.get('/ai-chat/api/models/');
    return response.data.data || response.data;
  }

  async syncModels(): Promise<{ message: string; models: LLMModel[] }> {
    const response = await api.post('/ai-chat/api/models/sync_models/');
    return response.data.data || response.data;
  }

  // Preset Management
  async getPresets(): Promise<ChatPreset[]> {
    const response = await api.get('/ai-chat/api/presets/');
    return response.data.data || response.data;
  }

  async createPreset(data: Partial<ChatPreset>): Promise<ChatPreset> {
    const response = await api.post('/ai-chat/api/presets/', data);
    return response.data.data || response.data;
  }

  async updatePreset(presetId: number, data: Partial<ChatPreset>): Promise<ChatPreset> {
    const response = await api.patch(`/ai-chat/api/presets/${presetId}/`, data);
    return response.data.data || response.data;
  }

  async deletePreset(presetId: number): Promise<void> {
    await api.delete(`/ai-chat/api/presets/${presetId}/`);
  }

  async createSessionFromPreset(presetId: number): Promise<ChatSession> {
    const response = await api.post(`/ai-chat/api/presets/${presetId}/create_session_from_preset/`);
    return response.data.data || response.data;
  }

  // Health and Stats
  async checkLLMServerHealth(): Promise<any> {
    const response = await api.get('/ai-chat/api/health/llm_server/');
    return response.data.data || response.data;
  }

  async getUserStats(): Promise<any> {
    const response = await api.get('/ai-chat/api/health/stats/');
    return response.data.data || response.data;
  }

  // WebSocket Management
  createWebSocket(sessionId: string): WebSocket {
    const wsUrl = `${this.wsUrl}/ws/ai-chat/session/${sessionId}/`;
    return new WebSocket(wsUrl);
  }

  sendWebSocketMessage(ws: WebSocket, message: WebSocketMessage): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }
}

// WebSocket Manager for easier connection management
export class WebSocketManager {
  private ws: WebSocket | null = null;
  private sessionId: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private onMessage?: (data: WebSocketResponse) => void;
  private onError?: (error: Event) => void;
  private onConnect?: () => void;
  private onDisconnect?: () => void;

  constructor(
    sessionId: string,
    callbacks: {
      onMessage?: (data: WebSocketResponse) => void;
      onError?: (error: Event) => void;
      onConnect?: () => void;
      onDisconnect?: () => void;
    } = {}
  ) {
    this.sessionId = sessionId;
    this.onMessage = callbacks.onMessage;
    this.onError = callbacks.onError;
    this.onConnect = callbacks.onConnect;
    this.onDisconnect = callbacks.onDisconnect;
  }

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    const api = new AiChatApi();
    this.ws = api.createWebSocket(this.sessionId!);

    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
      this.onConnect?.();
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.onMessage?.(data);
      } catch (e) {
        console.error('Failed to parse WebSocket message:', e);
      }
    };

    this.ws.onerror = (error) => {
      this.onError?.(error);
    };

    this.ws.onclose = () => {
      this.onDisconnect?.();
      this.attemptReconnect();
    };
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        this.connect();
      }, this.reconnectDelay * this.reconnectAttempts);
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  sendMessage(message: string): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'send_message',
        message,
      }));
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// Export default instance
export const aiChatApi = new AiChatApi(); 
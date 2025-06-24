import axios, { AxiosError } from "axios";
import type { APIResponse } from "./features/device-classifier/types";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export interface Task {
  id: string;
  description: string;
  completed: boolean;
}

export class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = "ApiError";
  }
}

export const todoApi = {
  getTasks: async (): Promise<Task[]> => {
    try {
      const response = await api.get("/");
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new ApiError(
          error.response?.data?.detail || "Failed to fetch tasks",
          error.response?.status
        );
      }
      throw error;
    }
  },

  createTask: async (description: string): Promise<Task> => {
    try {
      const response = await api.post("/", { description, completed: false });
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new ApiError(
          error.response?.data?.detail || "Failed to create task",
          error.response?.status
        );
      }
      throw error;
    }
  },

  updateTask: async (id: string, data: Partial<Task>): Promise<Task> => {
    try {
      const response = await api.patch(`/${id}/`, data);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new ApiError(
          error.response?.data?.detail || "Failed to update task",
          error.response?.status
        );
      }
      throw error;
    }
  },

  deleteTask: async (id: string): Promise<void> => {
    try {
      await api.delete(`/${id}/`);
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new ApiError(
          error.response?.data?.detail || "Failed to delete task",
          error.response?.status
        );
      }
      throw error;
    }
  },
};

export const deviceClassifierApi = {
  classifyImage: async (image: File): Promise<APIResponse> => {
    const formData = new FormData();
    formData.append("device", image);
    const response = await api.post("/device-classifier/classify/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
};

// AI Chat and Geospatial Analysis API
export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  metadata?: {
    geospatialData?: any;
    analysisType?: string;
    mapBounds?: [number, number, number, number];
    drawnFeatures?: any[];
  };
}

export interface GeospatialAnalysisRequest {
  query: string;
  features?: any[]; // GeoJSON features from map drawings
  bounds?: [number, number, number, number]; // Map bounds [west, south, east, north]
  analysisType?:
    | "spatial"
    | "statistical"
    | "pattern"
    | "route"
    | "buffer"
    | "intersection";
  context?: string; // Additional context about the map/data
}

export interface GeospatialAnalysisResponse {
  analysis: string;
  visualizations?: {
    type: "heatmap" | "cluster" | "route" | "buffer" | "polygon";
    data: any;
    style?: any;
  }[];
  suggestions?: string[];
  dataInsights?: {
    summary: string;
    statistics: Record<string, any>;
  };
}

export interface MCPRequest {
  model: string;
  messages: ChatMessage[];
  tools?: {
    name: string;
    description: string;
    parameters: any;
  }[];
  geospatialContext?: {
    features: any[];
    bounds: [number, number, number, number];
    mapCenter: [number, number];
    zoomLevel: number;
  };
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export const aiChatApi = {
  // Create a new chat session
  createChatSession: async (title?: string): Promise<ChatSession> => {
    try {
      const response = await api.post("/ai-chat/sessions/", {
        title: title || "New Geospatial Analysis",
      });
      return {
        ...response.data,
        createdAt: new Date(response.data.createdAt),
        updatedAt: new Date(response.data.updatedAt),
        messages: response.data.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        })),
      };
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new ApiError(
          error.response?.data?.detail || "Failed to create chat session",
          error.response?.status
        );
      }
      throw error;
    }
  },

  // Get all chat sessions
  getChatSessions: async (): Promise<ChatSession[]> => {
    try {
      const response = await api.get("/ai-chat/sessions/");
      return response.data.map((session: any) => ({
        ...session,
        createdAt: new Date(session.createdAt),
        updatedAt: new Date(session.updatedAt),
        messages: session.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        })),
      }));
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new ApiError(
          error.response?.data?.detail || "Failed to fetch chat sessions",
          error.response?.status
        );
      }
      throw error;
    }
  },

  // Get a specific chat session
  getChatSession: async (sessionId: string): Promise<ChatSession> => {
    try {
      const response = await api.get(`/ai-chat/sessions/${sessionId}/`);
      return {
        ...response.data,
        createdAt: new Date(response.data.createdAt),
        updatedAt: new Date(response.data.updatedAt),
        messages: response.data.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        })),
      };
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new ApiError(
          error.response?.data?.detail || "Failed to fetch chat session",
          error.response?.status
        );
      }
      throw error;
    }
  },

  // Send chat message with geospatial context
  sendMessage: async (
    request: GeospatialAnalysisRequest
  ): Promise<GeospatialAnalysisResponse> => {
    try {
      const response = await api.post("/ai/chat/geospatial", request);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new ApiError(
          error.response?.data?.detail ||
            "Failed to process geospatial analysis",
          error.response?.status
        );
      }
      throw error;
    }
  },

  // Stream chat responses
  streamMessage: async function* (
    request: GeospatialAnalysisRequest
  ): AsyncGenerator<string, void, unknown> {
    try {
      const response = await fetch(
        `${api.defaults.baseURL}/ai/chat/geospatial/stream`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(request),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("No response body reader available");
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") return;
            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                yield parsed.content;
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error) {
      throw new ApiError("Failed to stream chat response");
    }
  },

  // MCP (Model Context Protocol) integration
  sendMCPRequest: async (request: MCPRequest): Promise<ChatMessage> => {
    try {
      const response = await api.post("/ai/mcp/chat", request);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new ApiError(
          error.response?.data?.detail || "Failed to process MCP request",
          error.response?.status
        );
      }
      throw error;
    }
  },

  // Get available geospatial analysis tools
  getAvailableTools: async (): Promise<
    { name: string; description: string; parameters: any }[]
  > => {
    try {
      const response = await api.get("/ai/tools/geospatial");
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new ApiError(
          error.response?.data?.detail || "Failed to fetch available tools",
          error.response?.status
        );
      }
      throw error;
    }
  },

  // Load geospatial datasets
  loadDataset: async (
    datasetId: string,
    bounds?: [number, number, number, number]
  ): Promise<any> => {
    try {
      const response = await api.get(`/ai/datasets/${datasetId}`, {
        params: bounds ? { bounds: bounds.join(",") } : {},
      });
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new ApiError(
          error.response?.data?.detail || "Failed to load dataset",
          error.response?.status
        );
      }
      throw error;
    }
  },

  // Get chat history
  getChatHistory: async (sessionId?: string): Promise<ChatMessage[]> => {
    try {
      const response = await api.get("/ai/chat/history", {
        params: sessionId ? { sessionId } : {},
      });
      return response.data.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      }));
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new ApiError(
          error.response?.data?.detail || "Failed to fetch chat history",
          error.response?.status
        );
      }
      throw error;
    }
  },

  // Delete a chat session
  deleteChatSession: async (sessionId: string): Promise<void> => {
    try {
      await api.delete(`/ai-chat/sessions/${sessionId}/`);
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new ApiError(
          error.response?.data?.detail || "Failed to delete chat session",
          error.response?.status
        );
      }
      throw error;
    }
  },

  // Get available geospatial datasets
  getGeospatialDatasets: async (): Promise<any[]> => {
    try {
      const response = await api.get("/ai-chat/datasets/");
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new ApiError(
          error.response?.data?.detail || "Failed to fetch datasets",
          error.response?.status
        );
      }
      throw error;
    }
  },

  // Query geospatial data
  queryGeospatialData: async (query: {
    dataset?: string;
    bounds?: [number, number, number, number];
    filters?: Record<string, any>;
    limit?: number;
  }): Promise<any> => {
    try {
      const response = await api.post("/ai-chat/query-data/", query);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new ApiError(
          error.response?.data?.detail || "Failed to query data",
          error.response?.status
        );
      }
      throw error;
    }
  },
};

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
      const response = await api.get("/tasks/");
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
      const response = await api.post("/tasks/", {
        description,
        completed: false,
      });
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
      const response = await api.patch(`/tasks/${id}/`, data);
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
      await api.delete(`/tasks/${id}/`);
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

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export const aiChatApi = {
  // Create a new chat session - using existing backend endpoint
  createChatSession: async (title?: string): Promise<ChatSession> => {
    try {
      const response = await api.post("/ai-chat/api/sessions/", {
        title: title || "New Chat Session",
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

  // Get all chat sessions - using existing backend endpoint
  getChatSessions: async (): Promise<ChatSession[]> => {
    try {
      const response = await api.get("/ai-chat/api/sessions/");
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

  // Get a specific chat session - using existing backend endpoint
  getChatSession: async (sessionId: string): Promise<ChatSession> => {
    try {
      const response = await api.get(`/ai-chat/api/sessions/${sessionId}/`);
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

  // Send message to chat session - using existing backend endpoint
  sendMessage: async (sessionId: string, message: string): Promise<any> => {
    try {
      const response = await api.post(
        `/ai-chat/api/sessions/${sessionId}/send_message/`,
        {
          message,
          stream: false,
        }
      );
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new ApiError(
          error.response?.data?.detail || "Failed to send message",
          error.response?.status
        );
      }
      throw error;
    }
  },

  // Get chat messages - using existing backend endpoint
  getMessages: async (sessionId: string): Promise<ChatMessage[]> => {
    try {
      const response = await api.get(
        `/ai-chat/api/sessions/${sessionId}/messages/`
      );
      return response.data.messages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      }));
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new ApiError(
          error.response?.data?.detail || "Failed to fetch messages",
          error.response?.status
        );
      }
      throw error;
    }
  },

  // Delete a chat session - using existing backend endpoint
  deleteChatSession: async (sessionId: string): Promise<void> => {
    try {
      await api.delete(`/ai-chat/api/sessions/${sessionId}/`);
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

  // Get available models - using existing backend endpoint
  getModels: async (): Promise<any[]> => {
    try {
      const response = await api.get("/ai-chat/api/models/");
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new ApiError(
          error.response?.data?.detail || "Failed to fetch models",
          error.response?.status
        );
      }
      throw error;
    }
  },

  // Sync models - using existing backend endpoint
  syncModels: async (): Promise<any> => {
    try {
      const response = await api.post("/ai-chat/api/models/sync_models/");
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new ApiError(
          error.response?.data?.detail || "Failed to sync models",
          error.response?.status
        );
      }
      throw error;
    }
  },

  // Health check - using existing backend endpoint
  checkHealth: async (): Promise<any> => {
    try {
      const response = await api.get("/ai-chat/api/health/llm_server/");
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new ApiError(
          error.response?.data?.detail || "Failed to check health",
          error.response?.status
        );
      }
      throw error;
    }
  },
};

// Shapefile Upload API - using existing backend endpoints
export interface ShapefileLayer {
  id: number;
  name: string;
  description: string;
  created_at: string;
  feature_count: number;
  file_name: string;
  file_size: number;
  geometry_type: string;
  srid: number;
}

export interface ShapefileUploadResponse {
  success: boolean;
  message: string;
  layer?: ShapefileLayer;
  errors?: string[];
  warning?: string;
  error?: string;
  details?: string;
  processing_stats?: {
    features_created: number;
    attributes_created: number;
    errors: string[];
    field_info: Record<string, any>;
  };
}

export interface ShapefilePreviewResponse {
  success: boolean;
  preview?: {
    layer_name: string;
    geometry_type: string;
    feature_count: number;
    srid: number;
    attributes: {
      [key: string]: {
        data_type: string;
        sample_values: any[];
      };
    };
    first_features: any[];
  };
  errors?: string[];
}

export const shapefileApi = {
  // Upload a shapefile - using existing backend endpoint
  uploadShapefile: async (
    file: File,
    layerName?: string,
    description?: string,
    onProgress?: (progress: number) => void
  ): Promise<ShapefileUploadResponse> => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      if (layerName) formData.append("layer_name", layerName);
      if (description) formData.append("description", description);

      const response = await api.post("/map/layers/upload/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(progress);
          }
        },
      });

      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new ApiError(
          error.response?.data?.message || "Failed to upload shapefile",
          error.response?.status
        );
      }
      throw error;
    }
  },

  // Preview a shapefile before upload - using existing backend endpoint
  previewShapefile: async (file: File): Promise<ShapefilePreviewResponse> => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await api.post("/map/layers/preview/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new ApiError(
          error.response?.data?.message || "Failed to preview shapefile",
          error.response?.status
        );
      }
      throw error;
    }
  },

  // Get all layers - using existing backend endpoint
  getLayers: async (): Promise<ShapefileLayer[]> => {
    try {
      const response = await api.get("/map/layers/");
      return response.data.data || response.data.results || response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new ApiError(
          error.response?.data?.detail || "Failed to fetch layers",
          error.response?.status
        );
      }
      throw error;
    }
  },

  // Get a specific layer - using existing backend endpoint
  getLayer: async (layerId: number): Promise<ShapefileLayer> => {
    try {
      const response = await api.get(`/map/layers/${layerId}/`);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new ApiError(
          error.response?.data?.detail || "Failed to fetch layer",
          error.response?.status
        );
      }
      throw error;
    }
  },

  // Delete a layer - using existing backend endpoint
  deleteLayer: async (layerId: number): Promise<void> => {
    try {
      await api.delete(`/map/layers/${layerId}/`);
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new ApiError(
          error.response?.data?.detail || "Failed to delete layer",
          error.response?.status
        );
      }
      throw error;
    }
  },

  // Get layer as GeoJSON - using existing backend endpoint
  getLayerGeoJSON: async (layerId: number): Promise<any> => {
    try {
      const response = await api.get(`/map/layers/${layerId}/geojson/`);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new ApiError(
          error.response?.data?.detail || "Failed to fetch layer GeoJSON",
          error.response?.status
        );
      }
      throw error;
    }
  },

  // Get layer features - using existing backend endpoint
  getLayerFeatures: async (layerId: number): Promise<any[]> => {
    try {
      const response = await api.get(`/map/layers/${layerId}/features/`);
      return response.data.features || response.data.results || response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new ApiError(
          error.response?.data?.detail || "Failed to fetch layer features",
          error.response?.status
        );
      }
      throw error;
    }
  },

  // Get layer attributes summary - using existing backend endpoint
  getLayerAttributesSummary: async (layerId: number): Promise<any> => {
    try {
      const response = await api.get(
        `/map/layers/${layerId}/attributes/summary/`
      );
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new ApiError(
          error.response?.data?.detail || "Failed to fetch layer attributes",
          error.response?.status
        );
      }
      throw error;
    }
  },

  // Get attribute statistics - using existing backend endpoint
  getAttributeStats: async (
    layerId: number,
    attributeKey: string
  ): Promise<any> => {
    try {
      const response = await api.get(
        `/map/layers/${layerId}/attributes/${attributeKey}/stats/`
      );
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new ApiError(
          error.response?.data?.detail || "Failed to fetch attribute stats",
          error.response?.status
        );
      }
      throw error;
    }
  },

  // Filter features - using existing backend endpoint
  filterFeatures: async (layerId: number, filters: any[]): Promise<any> => {
    try {
      const response = await api.post(
        `/map/layers/${layerId}/features/filter/`,
        {
          filters,
        }
      );
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new ApiError(
          error.response?.data?.detail || "Failed to filter features",
          error.response?.status
        );
      }
      throw error;
    }
  },
};

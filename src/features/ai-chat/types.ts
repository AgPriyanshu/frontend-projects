export interface ChatSession {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  messageCount: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  metadata?: {
    geospatialData?: any;
    analysisType?: string;
    mapBounds?: [number, number, number, number];
    drawnFeatures?: any[];
    visualizations?: Array<{
      type: "heatmap" | "cluster" | "route" | "buffer" | "polygon";
      data: any;
      style?: any;
    }>;
    dataInsights?: {
      summary: string;
      statistics: Record<string, any>;
    };
  };
}

export interface GeospatialContext {
  features: any[]; // GeoJSON features from map drawings
  bounds: [number, number, number, number]; // Map bounds [west, south, east, north]
  mapCenter: [number, number];
  zoomLevel: number;
  visibleLayers?: string[];
  selectedFeatures?: any[];
}

export interface AnalysisResult {
  type:
    | "spatial"
    | "statistical"
    | "pattern"
    | "route"
    | "buffer"
    | "intersection";
  summary: string;
  details: any;
  visualizations?: Array<{
    type: string;
    data: any;
    style?: any;
  }>;
  recommendations?: string[];
}

export interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  isStreaming: boolean;
  currentSessionId: string | null;
  geospatialContext: GeospatialContext | null;
  availableTools: Array<{
    name: string;
    description: string;
    parameters: any;
  }>;
  error: string | null;
}

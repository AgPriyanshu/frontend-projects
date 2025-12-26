import axios from 'axios';

// Types for the API responses
export interface GeospatialImage {
  id: string;
  user: number;
  name: string;
  original_image: string;
  processed_image?: string;
  bounds?: [number, number, number, number]; // [west, south, east, north]
  center_lat?: number;
  center_lng?: number;
  zoom_level: number;
  created_at: string;
  updated_at: string;
  processing_status: 'pending' | 'processing' | 'completed' | 'failed';
}

export interface DetectedObject {
  id: string;
  detection: string;
  geometry: GeoJSON.Geometry;
  properties: Record<string, any>;
  object_type?: string;
  confidence_score: number;
  area?: number;
}

export interface ObjectDetection {
  id: string;
  geospatial_image: string;
  detection_data: GeoJSON.FeatureCollection;
  confidence_threshold: number;
  model_version: string;
  processing_time?: number;
  created_at: string;
  objects?: DetectedObject[];
}

export interface GeospatialImageDetail extends GeospatialImage {
  detections: ObjectDetection[];
}

// API base configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/map`,
  timeout: 30000, // 30 seconds timeout for object detection
});

// Add auth token if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Map API service
export class MapApiService {
  // Upload a geospatial image
  static async uploadImage(file: File, metadata: {
    name: string;
    bounds?: [number, number, number, number];
    center_lat?: number;
    center_lng?: number;
    zoom_level?: number;
  }): Promise<GeospatialImage> {
    const formData = new FormData();
    formData.append('original_image', file);
    formData.append('name', metadata.name);
    
    if (metadata.bounds) {
      formData.append('bounds', JSON.stringify(metadata.bounds));
    }
    if (metadata.center_lat) {
      formData.append('center_lat', metadata.center_lat.toString());
    }
    if (metadata.center_lng) {
      formData.append('center_lng', metadata.center_lng.toString());
    }
    if (metadata.zoom_level) {
      formData.append('zoom_level', metadata.zoom_level.toString());
    }

    const response = await api.post<GeospatialImage>('/images/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Upload image and immediately start object detection
  static async uploadAndDetect(
    file: File, 
    metadata: {
      name: string;
      bounds?: [number, number, number, number];
      center_lat?: number;
      center_lng?: number;
      zoom_level?: number;
    },
    detectionOptions: {
      confidence_threshold?: number;
      model_type?: 'vit_h' | 'vit_l' | 'vit_b';
    } = {}
  ): Promise<ObjectDetection> {
    const formData = new FormData();
    formData.append('original_image', file);
    formData.append('name', metadata.name);
    
    if (metadata.bounds) {
      formData.append('bounds', JSON.stringify(metadata.bounds));
    }
    if (metadata.center_lat) {
      formData.append('center_lat', metadata.center_lat.toString());
    }
    if (metadata.center_lng) {
      formData.append('center_lng', metadata.center_lng.toString());
    }
    if (metadata.zoom_level) {
      formData.append('zoom_level', metadata.zoom_level.toString());
    }

    // Add detection options
    formData.append('confidence_threshold', (detectionOptions.confidence_threshold || 0.5).toString());
    formData.append('model_type', detectionOptions.model_type || 'vit_h');

    const response = await api.post<ObjectDetection>('/images/upload_and_detect/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Get all geospatial images for the current user
  static async getImages(): Promise<GeospatialImage[]> {
    const response = await api.get<GeospatialImage[]>('/images/');
    return response.data;
  }

  // Get a specific image with detection results
  static async getImageDetail(id: string): Promise<GeospatialImageDetail> {
    const response = await api.get<GeospatialImageDetail>(`/images/${id}/`);
    return response.data;
  }

  // Perform object detection on an existing image
  static async detectObjects(
    imageId: string, 
    options: {
      confidence_threshold?: number;
      model_type?: 'vit_h' | 'vit_l' | 'vit_b';
    } = {}
  ): Promise<ObjectDetection> {
    const response = await api.post<ObjectDetection>(
      `/images/${imageId}/detect_objects/`,
      {
        confidence_threshold: options.confidence_threshold || 0.5,
        model_type: options.model_type || 'vit_h',
      }
    );
    return response.data;
  }

  // Get all object detections for the current user
  static async getDetections(): Promise<ObjectDetection[]> {
    const response = await api.get<ObjectDetection[]>('/detections/');
    return response.data;
  }

  // Get a specific object detection
  static async getDetection(id: string): Promise<ObjectDetection> {
    const response = await api.get<ObjectDetection>(`/detections/${id}/`);
    return response.data;
  }

  // Delete a geospatial image
  static async deleteImage(id: string): Promise<void> {
    await api.delete(`/images/${id}/`);
  }
}

export default MapApiService;

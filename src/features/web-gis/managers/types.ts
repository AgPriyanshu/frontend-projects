/**
 * Core type definitions for WebGIS state management
 */

import type {
  GeoJSONSourceSpecification,
  RasterSourceSpecification,
  VectorSourceSpecification,
} from "maplibre-gl";

// ===== Source Types =====

export type SourceType =
  | "geojson"
  | "vector"
  | "raster"
  | "raster-dem"
  | "image";

export interface MapSource {
  id: string;
  type: SourceType;

  // GeoJSON source
  data?: GeoJSON.FeatureCollection | string;

  // Vector/Raster tile sources
  url?: string;
  tiles?: string[];

  // Common properties
  attribution?: string;
  bounds?: [number, number, number, number];
  minzoom?: number;
  maxzoom?: number;
  tileSize?: number;

  // Metadata
  metadata?: {
    name?: string;
    description?: string;
    [key: string]: any;
  };
}

// ===== Layer Types =====

export type LayerType =
  | "fill"
  | "line"
  | "circle"
  | "symbol"
  | "raster"
  | "heatmap"
  | "fill-extrusion"
  | "hillshade"
  | "background";

export interface MapLayer {
  id: string;
  sourceId: string;
  sourceLayer?: string; // For vector tiles
  type: LayerType;

  // Visual properties
  paint: Record<string, any>;
  layout: Record<string, any>;

  // Visibility & rendering
  visible: boolean;
  opacity: number;

  // Zoom constraints
  minZoom?: number;
  maxZoom?: number;

  // Organization & metadata
  metadata?: {
    name: string;
    description?: string;
    group?: string;
    legend?: LegendConfig;
    [key: string]: any;
  };

  // Filtering
  filter?: any[]; // MapLibre filter expression
}

export interface LegendConfig {
  type: "simple" | "graduated" | "categorical";
  items: LegendItem[];
}

export interface LegendItem {
  label: string;
  color?: string;
  symbol?: string;
  size?: number;
}

// ===== Viewport Types =====

export interface ViewportState {
  center: [number, number]; // [longitude, latitude]
  zoom: number;
  bearing?: number;
  pitch?: number;
  bounds?: [[number, number], [number, number]];
  projection?: string; // e.g., 'globe', 'mercator'
}

export interface ViewportConstraints {
  minZoom?: number;
  maxZoom?: number;
  maxBounds?: [[number, number], [number, number]];
}

// ===== Workspace Types =====

export interface WorkspaceSnapshot {
  id: string;
  name: string;
  description?: string;
  version: string;
  createdAt: Date;
  modifiedAt: Date;

  // State snapshot
  viewport: ViewportState;
  sources: MapSource[];
  layers: MapLayer[];
  basemapId?: string;

  // User data
  metadata?: Record<string, any>;
}

// ===== Basemap Types =====

export interface Basemap {
  id: string;
  name: string;
  thumbnail?: string;
  url: string;
  type: "raster" | "vector";
  attribution?: string;
}

// ===== Drawing/Selection Types =====

export type DrawingMode =
  | "none"
  | "point"
  | "line"
  | "polygon"
  | "circle"
  | "rectangle"
  | "freehand"
  | "select"
  | "edit"
  | "delete";

export interface SelectionState {
  selectedFeatureIds: Set<string>;
  hoveredFeatureId: string | null;
  selectedFeatures: GeoJSON.Feature[];
  selectionMode: "single" | "multiple" | "box";
}

export interface DrawingState {
  mode: DrawingMode;
  activeDrawing: GeoJSON.Feature | null;
  drawnFeatures: GeoJSON.FeatureCollection;
  editingFeatureId: string | null;
}

// ===== Utility Types =====

export type BoundingBox = [[number, number], [number, number]];

export interface LayerGroup {
  id: string;
  name: string;
  layerIds: string[];
  visible: boolean;
  expanded?: boolean;
}

import type { DatasetNodeType } from "src/features/web-gis/types";

export const DatasetType = {
  VECTOR: "vector",
  RASTER: "raster",
  TEXT: "text",
} as const;

export type DatasetType = (typeof DatasetType)[keyof typeof DatasetType];

export const RasterKind = {
  ELEVATION: "elevation",
  ORTHO: "ortho",
  RASTER: "raster",
} as const;

export type RasterKind = (typeof RasterKind)[keyof typeof RasterKind];

export const TilesetStatus = {
  PENDING: "pending",
  PROCESSING: "processing",
  READY: "ready",
  FAILED: "failed",
} as const;

export interface TileSetResponse {
  id: string;
  status: (typeof TilesetStatus)[keyof typeof TilesetStatus];
  storagePath: string;
  fileSize: number;
  minZoom: number;
  maxZoom: number;
  bounds: [number, number, number, number] | null;
  errorMessage: string;
  createdAt: string;
  updatedAt: string;
}

export interface DatasetResponse {
  id: string;
  fileName: string;
  fileSize: string;
  cloudStoragePath: string;
  description: string;
  type: DatasetType;
  format: string;
  tileset: TileSetResponse | null;
  createdAt: string;
}

export interface DatasetNodeResponse {
  id: string;
  name: string;
  type: DatasetNodeType;
  parent: string | null;
  children: DatasetNodeResponse[];
  dataset: DatasetResponse | null;
  createdAt: string;
}

export interface DatasetNodeUploadPayload {
  // Node information.
  name: string;
  parent: string | null; // ID of parent DatasetNode.
  type: DatasetNodeType;
  dataset_type?: DatasetType;

  // Files.
  files: File[];
}

// Layer API types.
export interface LayerStyleSpec {
  type?: string;
  paint?: Record<string, unknown>;
  layout?: Record<string, unknown>;
}

export interface LayerResponse {
  id: string;
  name: string;
  source: string;
  style: LayerStyleSpec;
  bbox: [number, number, number, number] | null; // [minLng, minLat, maxLng, maxLat].
  datasetType: DatasetType | null; // Type of the source dataset.
  rasterKind: RasterKind | null;
  bandCount: number | null;
  tileset: TileSetResponse | null; // Tileset info for raster datasets.
}

export interface CreateLayerPayload {
  name: string;
  source: string;
  style?: LayerStyleSpec;
}

// Processing (geoprocessing tool) API types.
export const ProcessingJobStatus = {
  PENDING: "pending",
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
} as const;

export type ProcessingJobStatus =
  (typeof ProcessingJobStatus)[keyof typeof ProcessingJobStatus];

export const ProcessingToolCategory = {
  RASTER: "raster",
  VECTOR: "vector",
} as const;

export type ProcessingToolCategory =
  (typeof ProcessingToolCategory)[keyof typeof ProcessingToolCategory];

export type ProcessingToolParamType =
  | "number"
  | "string"
  | "boolean"
  | "select"
  | "dataset"
  | "expression";

export interface ProcessingToolParamOption {
  value: string;
  label: string;
}

export interface ProcessingToolParam {
  name: string;
  label: string;
  type: ProcessingToolParamType;
  required?: boolean;
  default?: string | number | boolean;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  options?: ProcessingToolParamOption[];
  datasetType?: DatasetType;
}

export interface ProcessingToolDefinition {
  toolName: string;
  label: string;
  description: string;
  category: ProcessingToolCategory;
  inputTypes: DatasetType[];
  outputType?: DatasetType;
  parameters: ProcessingToolParam[];
}

export interface ProcessingToolsResponse {
  tools: ProcessingToolDefinition[];
}

export interface ProcessingJobResponse {
  id: string;
  toolName: string;
  status: ProcessingJobStatus;
  progress: number;
  parameters: Record<string, unknown>;
  inputDatasetIds: string[];
  outputDataset: string | null;
  outputNode: string | null;
  errorMessage: string;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProcessingJobPayload {
  toolName: string;
  inputDatasetIds: string[];
  parameters: Record<string, unknown>;
  outputName?: string;
  outputParentId?: string | null;
}

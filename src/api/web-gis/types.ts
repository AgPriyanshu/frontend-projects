import type { DatasetNodeType } from "src/features/web-gis/types";

export const DATASET_TYPES = {
  VECTOR: "vector",
  RASTER: "raster",
  TEXT: "text",
} as const;

export type DatasetType = (typeof DATASET_TYPES)[keyof typeof DATASET_TYPES];

export const RASTER_KINDS = {
  ELEVATION: "elevation",
  ORTHO: "ortho",
  RASTER: "raster",
} as const;

export type RasterKind = (typeof RASTER_KINDS)[keyof typeof RASTER_KINDS];

export const TILESET_STATUSES = {
  PENDING: "pending",
  PROCESSING: "processing",
  READY: "ready",
  FAILED: "failed",
} as const;

export interface TileSetResponse {
  id: string;
  status: (typeof TILESET_STATUSES)[keyof typeof TILESET_STATUSES];
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
  source: string; // Dataset ID.
  style: LayerStyleSpec;
  bbox: [number, number, number, number] | null; // [minLng, minLat, maxLng, maxLat].
  datasetType: DatasetType | null; // Type of the source dataset.
  rasterKind: RasterKind | null;
  bandCount: number | null;
  tileset: TileSetResponse | null; // Tileset info for raster datasets.
}

export interface CreateLayerPayload {
  name: string;
  source: string; // Dataset ID.
  style?: LayerStyleSpec;
}

// Multipart Upload Dataset.

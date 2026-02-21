import type { DatasetNodeType } from "src/features/web-gis/types";

export type DatasetType = "vector" | "raster" | "text" | "raster-dem";

export interface TileSetResponse {
  id: string;
  status: "pending" | "processing" | "ready" | "failed";
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
  tileset: TileSetResponse | null; // Tileset info for raster datasets.
}

export interface CreateLayerPayload {
  name: string;
  source: string; // Dataset ID.
  style?: LayerStyleSpec;
}

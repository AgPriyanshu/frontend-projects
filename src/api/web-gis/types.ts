import type { DatasetNodeType } from "src/features/web-gis/types";

export interface DatasetResponse {
  id: string;
  fileName: string;
  fileSize: string;
  cloudStoragePath: string;
  description: string;
  type: "text";
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
  // Node information
  name: string;
  parent: string | null; // ID of parent DatasetNode
  type: DatasetNodeType;

  // Files
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
  bbox: [number, number, number, number] | null; // [minLng, minLat, maxLng, maxLat]
}

export interface CreateLayerPayload {
  name: string;
  source: string; // Dataset ID.
  style?: LayerStyleSpec;
}

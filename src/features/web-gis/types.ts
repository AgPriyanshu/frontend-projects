import type { DatasetResponse } from "api/web-gis";

export const DatasetNodeType = {
  DATASET: "dataset",
  FOLDER: "folder",
} as const;

export type DatasetNodeType =
  (typeof DatasetNodeType)[keyof typeof DatasetNodeType];

export type Dataset = DatasetResponse;

export type DatasetNode = {
  id: string;
  name: string;
  type: DatasetNodeType;
  parent: string | null;
  children: DatasetNode[];
  dataset: Dataset | null;
  createdAt: string;
};

import type { Layer } from "../../types";

export interface ViewportConstraints {
  minZoom?: number;
  maxZoom?: number;
  maxBounds?: [[number, number], [number, number]];
}

export type WorkspaceState = {
  // Datasets.
  project: any;
  sites: any;
  iterations: any;

  // Map state.
  map: {
    center: [number, number];
    zoom: number;
    bearing: number;
    pitch: number;
    bounds: [number, number, number, number];
    minZoom: number;
    maxZoom: number;
    projection: "mercator";
    layers: Layer[];
  };
};

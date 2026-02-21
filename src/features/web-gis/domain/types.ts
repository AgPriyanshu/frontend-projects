/**
 * Engine-agnostic type definitions for Web-GIS platform.
 * These types are used across all stores and engine adapters.
 */

/**
 * Represents the current view state of the map.
 */
export interface MapView {
  center: [number, number];
  zoom: number;
  bearing: number;
  pitch: number;
}

/**
 * Available draw tool modes.
 */
export type DrawMode =
  | "point"
  | "linestring"
  | "polygon"
  | "rectangle"
  | "circle"
  | "freehand"
  | "select"
  | "static";

/**
 * Layer types supported by the platform.
 */
export type LayerType = "vector" | "raster" | "raster-dem" | "wms" | "geojson";

/**
 * Serialized layer representation for engine syncing.
 */
export interface SerializedLayer {
  id: string;
  type: LayerType;
  data: unknown;
  style: LayerStyle;
  visible: boolean;
  order: number;
  bbox?: [number, number, number, number];
}

/**
 * Layer style configuration.
 */
export interface LayerStyle {
  fillColor?: string;
  fillOpacity?: number;
  strokeColor?: string;
  strokeWidth?: number;
  pointRadius?: number;
  pointColor?: string;
}

/**
 * Default layer style values.
 */
export const DEFAULT_LAYER_STYLE: LayerStyle = {
  fillColor: "#088",
  fillOpacity: 0.4,
  strokeColor: "#088",
  strokeWidth: 2,
  pointRadius: 6,
  pointColor: "#088",
};

/**
 * Cleanup function returned by subscriptions.
 */
export type Unsubscribe = () => void;

/**
 * Initial map view for the application.
 */
export const DEFAULT_MAP_VIEW: MapView = {
  center: [78.9629, 20.5937],
  zoom: 2.6,
  bearing: 0,
  pitch: 0,
};

/**
 * Default workspace ID.
 */
export const DEFAULT_WORKSPACE_ID = "main";

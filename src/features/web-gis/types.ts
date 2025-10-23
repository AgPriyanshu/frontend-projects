export type LayerStyleSpec = {
  point?: {
    fillColor?: string;
    strokeColor?: string;
    strokeWidth?: number;
    radius?: number;
    symbol?: string;
    opacity?: number;
    label?: string;
    labelColor?: string;
    labelSize?: number;
  };

  line?: {
    strokeColor?: string;
    strokeWidth?: number;
    strokeOpacity?: number;
    dashArray?: number[];
    lineJoin?: "miter" | "round" | "bevel";
    lineCap?: "butt" | "round" | "square";
    label?: string;
    labelColor?: string;
    labelSize?: number;
  };

  polygon?: {
    fillColor?: string;
    fillOpacity?: number;
    strokeColor?: string;
    strokeWidth?: number;
    strokeOpacity?: number;
    pattern?: string;
    label?: string;
    labelColor?: string;
    labelSize?: number;
  };
};

export type Feature = {
  id: string;
  layerId: string;
  attributes: Record<string, any>;
  geometry: string;
};

export enum LayerType {
  Raster = "raster",
  Vector = "vector",
  Terrain = "terrain",
}

export type LayerProperties = {
  minZoom: number;
  maxZoom: number;
  bounds: number;
};

export type LayerSource = {
  url?: string;
  tiles?: Array<string>;
  bounds?: [number, number, number, number];
  minzoom?: number;
  maxzoom?: number;
  tileSize?: number;
  scheme?: "xyz" | "tms";
  attribution?: string;
  volatile?: boolean;
  features?: Feature[];
};

export type Layer = {
  id: string;
  groupId?: string;
  isVisible: boolean;
  styleSpec: LayerStyleSpec;
  type: LayerType;
  source: LayerSource;
};

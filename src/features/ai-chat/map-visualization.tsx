import { useEffect, useRef, useState, useCallback } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "../../components/ui/badge";
import type { 
  GeospatialVisualization, 
  GeoJSONFeature, 
  AttributeStatistics 
} from "./types";
import { 
  Map, 
  ZoomIn, 
  ZoomOut, 
  Home, 
  Info,
  Download
} from "lucide-react";

interface MapVisualizationProps {
  visualization: GeospatialVisualization;
  className?: string;
}

interface ColorScheme {
  [key: string]: string[];
}

const COLOR_SCHEMES: ColorScheme = {
  blues: ["#f7fbff", "#deebf7", "#c6dbef", "#9ecae1", "#6baed6", "#4292c6", "#2171b5", "#08519c", "#08306b"],
  reds: ["#fff5f0", "#fee0d2", "#fcbba1", "#fc9272", "#fb6a4a", "#ef3b2c", "#cb181d", "#a50f15", "#67000d"],
  greens: ["#f7fcf5", "#e5f5e0", "#c7e9c0", "#a1d99b", "#74c476", "#41ab5d", "#238b45", "#006d2c", "#00441b"],
  viridis: ["#440154", "#482878", "#3e4989", "#31688e", "#26828e", "#1f9e89", "#35b779", "#6ece58", "#b5de2b"],
  plasma: ["#0d0887", "#46039f", "#7201a8", "#9c179e", "#bd3786", "#d8576b", "#ed7953", "#fb9f3a", "#fdca26"]
};

export function MapVisualization({ visualization, className }: MapVisualizationProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<GeoJSONFeature | null>(null);
  const [popupInfo, setPopupInfo] = useState<{
    feature: GeoJSONFeature;
    coordinates: [number, number];
  } | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          "osm": {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution: "© OpenStreetMap contributors"
          }
        },
        layers: [
          {
            id: "osm",
            type: "raster",
            source: "osm"
          }
        ]
      },
      center: [0, 0],
      zoom: 1
    });

    map.current.on("load", () => {
      setMapLoaded(true);
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Generate color for choropleth styling
  const getFeatureColor = useCallback((feature: GeoJSONFeature): string => {
    if (!visualization.style_field || !visualization.field_stats || !visualization.break_values) {
      return "#3b82f6"; // Default blue
    }

    const value = feature.properties[visualization.style_field];
    if (value === null || value === undefined) {
      return "#gray-400";
    }

    const numericValue = typeof value === "number" ? value : parseFloat(value);
    if (isNaN(numericValue)) {
      return "#gray-400";
    }

    const breakValues = visualization.break_values;
    const colors = COLOR_SCHEMES[visualization.color_scheme] || COLOR_SCHEMES.blues;
    
    for (let i = 0; i < breakValues.length - 1; i++) {
      if (numericValue >= breakValues[i] && numericValue < breakValues[i + 1]) {
        return colors[Math.min(i, colors.length - 1)];
      }
    }
    
    return colors[colors.length - 1]; // Highest value
  }, [visualization]);

  // Add data to map
  useEffect(() => {
    if (!map.current || !mapLoaded || !visualization.geojson) return;

    const sourceId = `layer-${visualization.layer_id}`;
    const layerId = `layer-${visualization.layer_id}-fill`;

    // Remove existing layers/sources
    if (map.current.getLayer(layerId)) {
      map.current.removeLayer(layerId);
    }
    if (map.current.getSource(sourceId)) {
      map.current.removeSource(sourceId);
    }

    // Add source
    map.current.addSource(sourceId, {
      type: "geojson",
      data: visualization.geojson as any
    });

    // Determine styling based on geometry type and style type
    const geometryType = visualization.geojson.features[0]?.geometry.type;
    
    if (geometryType === "Polygon" || geometryType === "MultiPolygon") {
      // Add fill layer for polygons
      map.current.addLayer({
        id: layerId,
        type: "fill",
        source: sourceId,
        layout: {},
        paint: {
          "fill-color": visualization.style_type === "choropleth" ? 
            (generateChoroplethExpression() as any) : 
            "#3b82f6",
          "fill-opacity": 0.7,
          "fill-outline-color": "#1f2937"
        }
      });

      // Add outline layer
      map.current.addLayer({
        id: `${layerId}-outline`,
        type: "line",
        source: sourceId,
        layout: {},
        paint: {
          "line-color": "#1f2937",
          "line-width": 1
        }
      });
    } else if (geometryType === "Point" || geometryType === "MultiPoint") {
      // Add circle layer for points
      map.current.addLayer({
        id: layerId,
        type: "circle",
        source: sourceId,
        layout: {},
        paint: {
          "circle-color": visualization.style_type === "choropleth" ? 
            ["case", ...generateChoroplethExpression()] : 
            "#3b82f6",
          "circle-radius": 6,
          "circle-opacity": 0.8,
          "circle-stroke-color": "#1f2937",
          "circle-stroke-width": 1
        }
      });
    } else {
      // Add line layer for lines
      map.current.addLayer({
        id: layerId,
        type: "line",
        source: sourceId,
        layout: {},
        paint: {
          "line-color": "#3b82f6",
          "line-width": 2
        }
      });
    }

    // Add click handler
    map.current.on("click", layerId, (e) => {
      if (e.features && e.features.length > 0) {
        const feature = e.features[0] as any;
        setSelectedFeature(feature);
        setPopupInfo({
          feature: feature,
          coordinates: [e.lngLat.lng, e.lngLat.lat]
        });
      }
    });

    // Change cursor on hover
    map.current.on("mouseenter", layerId, () => {
      if (map.current) {
        map.current.getCanvas().style.cursor = "pointer";
      }
    });

    map.current.on("mouseleave", layerId, () => {
      if (map.current) {
        map.current.getCanvas().style.cursor = "";
      }
    });

    // Fit map to data bounds
    if (visualization.geojson.features.length > 0) {
      const bounds = new maplibregl.LngLatBounds();
      
      visualization.geojson.features.forEach(feature => {
        if (feature.geometry.type === "Point") {
          bounds.extend(feature.geometry.coordinates as [number, number]);
        } else if (feature.geometry.type === "Polygon") {
          feature.geometry.coordinates[0].forEach(coord => {
            bounds.extend(coord as [number, number]);
          });
        }
        // Add more geometry types as needed
      });

      map.current.fitBounds(bounds, { padding: 50 });
    }

    function generateChoroplethExpression(): any[] {
      if (!visualization.style_field || !visualization.break_values) {
        return ["#3b82f6"];
      }

      const colors = COLOR_SCHEMES[visualization.color_scheme] || COLOR_SCHEMES.blues;
      const breakValues = visualization.break_values;
      const expression: any[] = [];

      for (let i = 0; i < breakValues.length - 1; i++) {
        expression.push(
          ["<", ["to-number", ["get", visualization.style_field]], breakValues[i + 1]],
          colors[Math.min(i, colors.length - 1)]
        );
      }

      expression.push(colors[colors.length - 1]); // Default color
      return expression;
    }

  }, [mapLoaded, visualization, getFeatureColor]);

  const zoomIn = () => {
    if (map.current) {
      map.current.zoomIn();
    }
  };

  const zoomOut = () => {
    if (map.current) {
      map.current.zoomOut();
    }
  };

  const resetView = () => {
    if (map.current && visualization.geojson.features.length > 0) {
      const bounds = new maplibregl.LngLatBounds();
      
      visualization.geojson.features.forEach(feature => {
        if (feature.geometry.type === "Point") {
          bounds.extend(feature.geometry.coordinates as [number, number]);
        } else if (feature.geometry.type === "Polygon") {
          feature.geometry.coordinates[0].forEach(coord => {
            bounds.extend(coord as [number, number]);
          });
        }
      });

      map.current.fitBounds(bounds, { padding: 50 });
    }
  };

  const exportMap = () => {
    if (map.current) {
      const canvas = map.current.getCanvas();
      const link = document.createElement("a");
      link.download = `${visualization.layer_name}-visualization.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  const generateLegend = () => {
    if (visualization.style_type !== "choropleth" || !visualization.break_values || !visualization.field_stats) {
      return null;
    }

    const colors = COLOR_SCHEMES[visualization.color_scheme] || COLOR_SCHEMES.blues;
    const breakValues = visualization.break_values;

    return (
      <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-lg max-w-xs">
        <h4 className="font-semibold text-sm mb-2">{visualization.style_field}</h4>
        <div className="space-y-1">
          {breakValues.slice(0, -1).map((value, index) => (
            <div key={index} className="flex items-center gap-2 text-xs">
              <div 
                className="w-4 h-3 border"
                style={{ backgroundColor: colors[Math.min(index, colors.length - 1)] }}
              />
              <span>
                {value.toLocaleString()} - {breakValues[index + 1].toLocaleString()}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-2 text-xs text-gray-600">
          <div>Min: {visualization.field_stats.min?.toLocaleString()}</div>
          <div>Max: {visualization.field_stats.max?.toLocaleString()}</div>
          <div>Avg: {visualization.field_stats.avg?.toLocaleString()}</div>
        </div>
      </div>
    );
  };

  return (
    <Card className={`w-full h-96 ${className}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Map className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">{visualization.layer_name}</CardTitle>
          </div>
          <div className="flex items-center gap-1">
            <Badge variant="secondary">
              {visualization.feature_count} features
            </Badge>
            <Badge variant="outline">
              {visualization.style_type}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0 relative h-80">
        <div ref={mapContainer} className="w-full h-full rounded-b-lg" />
        
        {/* Map Controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-1">
          <Button size="sm" variant="secondary" onClick={zoomIn}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="secondary" onClick={zoomOut}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="secondary" onClick={resetView}>
            <Home className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="secondary" onClick={exportMap}>
            <Download className="h-4 w-4" />
          </Button>
        </div>

        {/* Legend */}
        {generateLegend()}

        {/* Feature Info Popup */}
        {popupInfo && (
          <div className="absolute top-4 left-4 bg-white p-3 rounded-lg shadow-lg max-w-sm">
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-semibold text-sm">Feature Information</h4>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => setPopupInfo(null)}
                className="h-6 w-6 p-0"
              >
                ×
              </Button>
            </div>
            <div className="space-y-1 text-xs">
              {Object.entries(popupInfo.feature.properties).slice(0, 6).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="font-medium text-gray-600">{key}:</span>
                  <span className="ml-2">{String(value)}</span>
                </div>
              ))}
              {Object.keys(popupInfo.feature.properties).length > 6 && (
                <div className="text-gray-500 italic">
                  ... and {Object.keys(popupInfo.feature.properties).length - 6} more attributes
                </div>
              )}
            </div>
          </div>
        )}

        {/* Analysis Info */}
        {visualization.highlighted_features && visualization.highlighted_features.length > 0 && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-blue-50 border border-blue-200 p-2 rounded-lg">
            <div className="flex items-center gap-1 text-sm text-blue-800">
              <Info className="h-4 w-4" />
              <span>{visualization.highlighted_features.length} features highlighted</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 
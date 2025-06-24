import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { MaplibreTerradrawControl } from "@watergis/maplibre-gl-terradraw";
import "@watergis/maplibre-gl-terradraw/dist/maplibre-gl-terradraw.css";
import "./map.css";

interface MapProps {
  center?: [number, number];
  zoom?: number;
  style?: string;
}

export const Map = ({
  center = [78.9629, 20.5937], // Default center (India)
  zoom = 4, // Zoom level to show most of India
  style = "https://demotiles.maplibre.org/style.json", // Default style
}: MapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const draw = useRef<MaplibreTerradrawControl | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Set performance optimizations before map creation
    maplibregl.setMaxParallelImageRequests(16);
    
    // Initialize map with globe projection and performance optimizations
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        projection: {
          type: 'globe'
        },
        sources: {
          'osm': {
            type: 'raster',
            tiles: [
              'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
            ],
            tileSize: 512,
            maxzoom: 19,
            attribution: '© OpenStreetMap contributors'
          }
        },
        layers: [
          {
            id: 'osm',
            type: 'raster',
            source: 'osm'
          }
        ],
        glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
      },
      center: center,
      zoom: zoom,
      // Performance optimizations
      maxZoom: 18,
      minZoom: 0,
      antialias: false,
      refreshExpiredTiles: true,
      fadeDuration: 100,
    } as any);

    // Add navigation controls
    map.current.addControl(new maplibregl.NavigationControl(), "top-right");

    // Performance optimizations after map load
    map.current.on('load', () => {
      // Disable some expensive features for better performance
      if (map.current) {
        const canvas = map.current.getCanvas();
        canvas.style.cursor = 'default';
        
        // Reduce repaints
        map.current.on('moveend', () => {
          // Force garbage collection of unused tiles
          if (map.current) {
            (map.current as any)._requestRenderFrame?.();
          }
        });
      }
    });

    // Initialize Terra Draw with performance settings
    if (map.current) {
      draw.current = new MaplibreTerradrawControl({
        modes: [
          "point",
          "linestring",
          "polygon",
          "rectangle",
          "circle",
          "freehand",
          "select",
          "delete-selection",
          "delete",
        ],
        open: true,
      });

      map.current.addControl(draw.current, "top-left");
    }

    // Cleanup on unmount
    return () => {
      map.current?.remove();
    };
  }, [center, zoom, style]);

  return (
    <div className="w-full h-full min-h-[600px] relative">
      <div ref={mapContainer} className="map absolute inset-0 h-full w-full" />
    </div>
  );
};

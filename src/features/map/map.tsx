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

    // Initialize map
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: style,
      center: center,
      zoom: zoom,
    });

    // Add navigation controls
    map.current.addControl(new maplibregl.NavigationControl(), "top-right");

    // Initialize Terra Draw
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

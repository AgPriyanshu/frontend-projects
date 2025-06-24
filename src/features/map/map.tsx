import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { MaplibreTerradrawControl } from "@watergis/maplibre-gl-terradraw";
import "@watergis/maplibre-gl-terradraw/dist/maplibre-gl-terradraw.css";
import "./map.css";

interface MapProps {
  center?: [number, number];
  zoom?: number;
}

export const Map = ({
  center = [78.9629, 20.5937], // Default center (India)
  zoom = 4, // Zoom level to show most of India
}: MapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const draw = useRef<MaplibreTerradrawControl | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map with simplified configuration
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://demotiles.maplibre.org/style.json",
      center: center,
      zoom: zoom,
      maxZoom: 18,
      minZoom: 0,
    });

    // Add navigation controls
    map.current.addControl(new maplibregl.NavigationControl(), "top-right");

    // Add globe control for toggling between flat and globe projections
    map.current.addControl(new maplibregl.GlobeControl(), "top-right");

    // Initialize Terra Draw
    map.current.on("load", () => {
      if (map.current) {
        // Enable globe projection
        map.current.setProjection({
          type: "globe",
        });

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
    });

    // Cleanup on unmount
    return () => {
      map.current?.remove();
    };
  }, [center, zoom]);

  return (
    <div className="w-full h-full min-h-[600px] relative">
      <div ref={mapContainer} className="map absolute inset-0 h-full w-full" />
    </div>
  );
};

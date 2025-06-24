import { useEffect, useRef, useCallback } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { MaplibreTerradrawControl } from "@watergis/maplibre-gl-terradraw";
import "@watergis/maplibre-gl-terradraw/dist/maplibre-gl-terradraw.css";
import "./map.css";
import type { GeospatialContext } from "@/features/ai-chat/types";

interface MapProps {
  center?: [number, number];
  zoom?: number;
  onGeospatialContextChange?: (context: GeospatialContext) => void;
}

export const Map = ({
  center = [78.9629, 20.5937], // Default center (India)
  zoom = 4, // Zoom level to show most of India
  onGeospatialContextChange,
}: MapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const draw = useRef<MaplibreTerradrawControl | null>(null);
  const contextCallbackRef = useRef(onGeospatialContextChange);

  // Update the callback ref when prop changes
  useEffect(() => {
    contextCallbackRef.current = onGeospatialContextChange;
  }, [onGeospatialContextChange]);

  // Update geospatial context for AI chat
  const updateGeospatialContext = useCallback(() => {
    if (!map.current || !contextCallbackRef.current) return;

    const mapInstance = map.current;
    const bounds = mapInstance.getBounds();
    const mapCenter = mapInstance.getCenter();
    const zoomLevel = Math.round(mapInstance.getZoom());

    // Get drawn features from Terra Draw
    let features: GeoJSON.Feature[] = [];
    if (draw.current) {
      try {
        // Get all features from Terra Draw - using the correct API
        const terraDrawInstance = (
          draw.current as unknown as {
            _terraDraw?: { getSnapshot?: () => GeoJSON.Feature[] };
          }
        )._terraDraw;
        if (terraDrawInstance && terraDrawInstance.getSnapshot) {
          const drawnFeatures = terraDrawInstance.getSnapshot();
          features = drawnFeatures || [];
        }
      } catch (error) {
        console.warn("Could not get drawn features:", error);
      }
    }

    const context: GeospatialContext = {
      features,
      bounds: [
        bounds.getWest(),
        bounds.getSouth(),
        bounds.getEast(),
        bounds.getNorth(),
      ],
      mapCenter: [mapCenter.lng, mapCenter.lat],
      zoomLevel,
      visibleLayers: [],
      selectedFeatures: [],
    };

    contextCallbackRef.current(context);
  }, []);

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

        // Update context after initial load
        setTimeout(updateGeospatialContext, 1000);
      }
    });

    // Listen for map changes to update geospatial context
    const handleMapChange = () => {
      updateGeospatialContext();
    };

    map.current.on("moveend", handleMapChange);
    map.current.on("zoomend", handleMapChange);

    // Listen for Terra Draw changes
    map.current.on("terra-draw.change", handleMapChange);
    map.current.on("terra-draw.finish", handleMapChange);
    map.current.on("terra-draw.delete", handleMapChange);

    // Cleanup on unmount
    return () => {
      if (map.current) {
        map.current.off("moveend", handleMapChange);
        map.current.off("zoomend", handleMapChange);
        map.current.off("terra-draw.change", handleMapChange);
        map.current.off("terra-draw.finish", handleMapChange);
        map.current.off("terra-draw.delete", handleMapChange);
        map.current.remove();
      }
    };
  }, [center, zoom]);

  return (
    <div className="w-full h-full min-h-[600px] relative">
      <div ref={mapContainer} className="map absolute inset-0 h-full w-full" />
    </div>
  );
};

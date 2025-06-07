import { useEffect, useRef, useState } from "react";
import "maplibre-gl/dist/maplibre-gl.css";
import "@watergis/maplibre-gl-terradraw/dist/maplibre-gl-terradraw.css";
import { MapManager } from "./MapManager";
import type { MapOptions } from "./MapManager";
import "./map.css";

interface MapProps extends MapOptions {}

export const Map = ({
  center = [78.9629, 20.5937], // Default center (India)
  zoom = 4, // Zoom level to show most of India
  style = "https://demotiles.maplibre.org/style.json", // Default style
}: MapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapManager = MapManager.getInstance();
  const [markerCount, setMarkerCount] = useState(0);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const mapInitialized = useRef(false);

  // Initialize map only once
  useEffect(() => {
    if (!mapContainer.current || mapInitialized.current) return;

    // Initialize map using MapManager
    const map = mapManager.initializeMap(mapContainer.current, {
      center,
      zoom,
      style,
    });

    // Wait for map to load
    map.on("load", () => {
      setIsMapLoaded(true);
    });

    mapInitialized.current = true;

    // Cleanup on unmount
    return () => {
      mapManager.cleanup();
      setIsMapLoaded(false);
      mapInitialized.current = false;
    };
  }, []); // Empty dependency array to run only once

  // Update map position and style when props change
  useEffect(() => {
    if (!isMapLoaded) return;

    mapManager.setCenter(center);
    mapManager.setZoom(zoom);
    mapManager.setStyle(style);
  }, [center, zoom, style, isMapLoaded]);

  const handleAddMarker = () => {
    if (!isMapLoaded) {
      console.warn("Map is not loaded yet");
      return;
    }

    const currentCenter = mapManager.getCenter();
    if (!currentCenter) {
      console.warn("Could not get current center");
      return;
    }

    const markerId = `marker-${markerCount}`;
    try {
      mapManager.addMarker({
        id: markerId,
        lngLat: currentCenter,
        popup: {
          content: `<h3>Marker ${
            markerCount + 1
          }</h3><p>Added at: ${new Date().toLocaleTimeString()}</p>`,
          options: {
            closeButton: true,
            closeOnClick: false,
          },
        },
        options: {
          color: "#FF0000",
          draggable: true,
        },
      });

      setMarkerCount((prev) => prev + 1);
    } catch (error) {
      console.error("Error adding marker:", error);
    }
  };

  return (
    <div className="w-full h-full min-h-[600px] relative">
      <div ref={mapContainer} className="map absolute inset-0 h-full w-full" />
      <button
        onClick={handleAddMarker}
        disabled={!isMapLoaded}
        className={`absolute bottom-4 right-4 px-4 py-2 rounded-md shadow-lg transition-colors duration-200 z-10 ${
          isMapLoaded
            ? "bg-blue-500 hover:bg-blue-600 text-white"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
        }`}
      >
        {isMapLoaded ? "Add Marker" : "Loading Map..."}
      </button>
    </div>
  );
};

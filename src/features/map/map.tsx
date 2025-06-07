import { useEffect, useRef, useState } from "react";
import maplibregl, { LngLatBounds } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import "@watergis/maplibre-gl-terradraw/dist/maplibre-gl-terradraw.css";
import { MapManager } from "./MapManager";
import type { MapOptions, GeoJSONFeature } from "./MapManager";
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

  const handleFileDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (!isMapLoaded || !mapManager.getMap()) {
      alert("Map is not fully loaded yet. Please wait and try again.");
      return;
    }

    const files = event.dataTransfer.files;
    if (!files || files.length === 0) {
      return;
    }

    const file = files[0];
    if (
      file.type !== "application/geo+json" &&
      !file.name.endsWith(".geojson")
    ) {
      alert("Please drop a valid GeoJSON file (.geojson).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (!e.target?.result || typeof e.target.result !== "string") {
        console.error("FileReader error: No result or result is not a string.");
        alert("Error: Failed to read file content.");
        return;
      }

      let geojsonData;
      try {
        geojsonData = JSON.parse(e.target.result);
      } catch (parseError) {
        console.error("GeoJSON parsing error:", parseError);
        alert(
          "Error: Could not parse the file. Please ensure it's valid JSON."
        );
        return;
      }

      // Basic GeoJSON structure validation
      if (
        !geojsonData ||
        typeof geojsonData !== "object" ||
        (!Array.isArray(geojsonData.features) && geojsonData.type !== "Feature" && geojsonData.type !== "FeatureCollection")
      ) {
        console.error("Invalid GeoJSON structure:", geojsonData);
        alert(
          "Error: Invalid GeoJSON structure. The file must be a Feature, FeatureCollection, or contain a 'features' array."
        );
        return;
      }

      // Handle single Feature GeoJSON by wrapping it in a FeatureCollection
      if (geojsonData.type === "Feature") {
        geojsonData = {
          type: "FeatureCollection",
          features: [geojsonData],
        };
      }

      if (!geojsonData.features || geojsonData.features.length === 0) {
        console.warn("GeoJSON file has no features.");
        alert("Warning: The GeoJSON file contains no features to display.");
        return;
      }

      const sourceId = `geojson-data-${Date.now()}`;
      const layerId = `geojson-layer-${Date.now()}`;

      try {
        mapManager.addSource(sourceId, {
          type: "geojson",
          data: geojsonData,
        });

        // Determine geometry type and add appropriate layer
        let layerType: "circle" | "line" | "fill" = "circle"; // Default
        let firstGeomType: string | null = null;
        let mixedTypesDetected = false;

        if (geojsonData.features && geojsonData.features.length > 0) {
          const firstFeature = geojsonData.features[0] as GeoJSONFeature;
          if (firstFeature.geometry && firstFeature.geometry.type) {
            firstGeomType = firstFeature.geometry.type;
            if (firstGeomType === "Point" || firstGeomType === "MultiPoint") {
              layerType = "circle";
            } else if (
              firstGeomType === "LineString" ||
              firstGeomType === "MultiLineString"
            ) {
              layerType = "line";
            } else if (
              firstGeomType === "Polygon" ||
              firstGeomType === "MultiPolygon"
            ) {
              layerType = "fill";
            } else {
                console.warn(`Unsupported geometry type: ${firstGeomType} for the first feature. Defaulting to circle layer.`);
                alert(`Warning: The first feature has an unsupported geometry type (${firstGeomType}). Attempting to render as points.`);
            }

            // Check for mixed geometry types
            for (let i = 1; i < geojsonData.features.length; i++) {
              const feature = geojsonData.features[i] as GeoJSONFeature;
              if (feature.geometry && feature.geometry.type !== firstGeomType) {
                 // More specific check for compatibility (e.g. Point and MultiPoint can use the same layer type)
                const currentMainType = (feature.geometry.type.includes("Point")) ? "Point" : (feature.geometry.type.includes("Line")) ? "LineString" : (feature.geometry.type.includes("Polygon")) ? "Polygon" : "Unknown";
                const firstMainType = (firstGeomType.includes("Point")) ? "Point" : (firstGeomType.includes("Line")) ? "LineString" : (firstGeomType.includes("Polygon")) ? "Polygon" : "Unknown";

                if(currentMainType !== firstMainType && firstMainType !== "Unknown" && currentMainType !== "Unknown" ) {
                    mixedTypesDetected = true;
                    break;
                }
              }
            }
            if (mixedTypesDetected) {
              console.warn(
                `Mixed geometry types detected. The layer will be based on the first feature's type (${firstGeomType}), which might not correctly render all features.`
              );
              alert(
                `Warning: Mixed geometry types detected in the GeoJSON. The map will attempt to render all features using a style suitable for ${firstGeomType}. Some features might not display as expected.`
              );
            }

          } else {
            console.warn("First feature in GeoJSON is missing geometry type. Defaulting to circle layer.");
            alert("Warning: First feature in GeoJSON is missing geometry information. Attempting to render as points.");
          }
        }


        if (layerType === "circle") {
          mapManager.addLayer({
            id: layerId,
            type: "circle",
            source: sourceId,
            paint: {
              "circle-radius": 7,
              "circle-color": "#007cbf", // Strong Blue
              "circle-stroke-width": 1.5,
              "circle-stroke-color": "#ffffff", // White
            },
          });
        } else if (layerType === "line") {
          mapManager.addLayer({
            id: layerId,
            type: "line",
            source: sourceId,
            paint: {
              "line-color": "#228B22", // Forest Green
              "line-width": 3,
            },
          });
        } else if (layerType === "fill") {
          mapManager.addLayer({
            id: layerId,
            type: "fill",
            source: sourceId,
            paint: {
              "fill-color": "#FF8C00", // Dark Orange
              "fill-opacity": 0.6,
              "fill-outline-color": "#A0522D", // Sienna (darker orange/brown)
            },
          });
        }

        // Fit map to bounds of the new layer
        const bounds = new LngLatBounds();
        if (geojsonData.features && Array.isArray(geojsonData.features)) {
          geojsonData.features.forEach((feature: GeoJSONFeature) => {
            if (feature.geometry && feature.geometry.coordinates) {
              const processCoordinates = (coords: any) => {
                if (
                  Array.isArray(coords) &&
                  coords.length === 2 &&
                  typeof coords[0] === "number" &&
                  typeof coords[1] === "number"
                ) {
                  bounds.extend(coords as [number, number]);
                } else if (Array.isArray(coords)) {
                  coords.forEach(processCoordinates);
                }
              };
              processCoordinates(feature.geometry.coordinates);
            }
          });
        }

        if (!bounds.isEmpty()) {
          mapManager.getMap()?.fitBounds(bounds, { padding: 50, maxZoom: 15 });
        } else {
          console.warn("Could not calculate bounds for the GeoJSON. It might be empty or contain invalid coordinates.");
          alert("Warning: Could not determine the geographic extent of the GeoJSON data. The map view will not be adjusted.");
        }
      } catch (mapError) {
        console.error("Error adding GeoJSON data to map:", mapError);
        alert(
          "Error: Could not add GeoJSON data to the map. The file might be valid GeoJSON but could contain unsupported structures or very large features. Check console for details."
        );
        // Clean up partially added source if it exists
        if (mapManager.getMap()?.getSource(sourceId)) {
          if (mapManager.getMap()?.getLayer(layerId)) {
            mapManager.removeLayer(layerId);
          }
          mapManager.removeSource(sourceId);
        }
      }
    };

    reader.onerror = (readError) => {
      console.error("FileReader error:", readError);
      alert("Error: Failed to read the selected file.");
    };

    reader.readAsText(file);
  };

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

    const currentMapContainer = mapContainer.current;
    const dragOverHandler = (event: DragEvent) => {
      event.preventDefault();
    };

    currentMapContainer.addEventListener("dragover", dragOverHandler);
    // The 'drop' event needs to be cast to React.DragEvent for the handler
    // However, addEventListener expects a standard EventListener, so we cast `handleFileDrop`
    // This is a common workaround when mixing React synthetic events and native DOM events.
    currentMapContainer.addEventListener("drop", handleFileDrop as unknown as EventListener);


    // Cleanup on unmount
    return () => {
      mapManager.cleanup();
      setIsMapLoaded(false);
      mapInitialized.current = false;
      if (currentMapContainer) {
        currentMapContainer.removeEventListener("dragover", dragOverHandler);
        currentMapContainer.removeEventListener("drop", handleFileDrop as unknown as EventListener);
      }
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
    if (!isMapLoaded || !mapManager.getMap()) {
      console.warn("Map is not loaded yet or map instance is not available");
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
    <div
      className="w-full h-full min-h-[600px] relative"
      onDragOver={(e) => e.preventDefault()} // Also adding here for completeness, though the direct DOM listener is primary
      onDrop={handleFileDrop} // React's onDrop for the container div
    >
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

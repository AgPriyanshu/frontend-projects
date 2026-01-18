import {
  FullscreenControl,
  GlobeControl,
  LngLatBounds,
  Map as MapLibre,
  Marker,
  NavigationControl,
  ScaleControl,
  TerrainControl,
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef, useState } from "react";

export const Map = () => {
  const mapRef = useRef<MapLibre | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const map = new MapLibre({
      container: "map",
      style: "https://demotiles.maplibre.org/globe.json",
      center: [78.9629, 20.5937],
      zoom: 2,
    });

    mapRef.current = map;

    // Controls.
    map.addControl(
      new FullscreenControl({
        container: document.getElementById("map") ?? undefined,
      })
    );
    map.addControl(new GlobeControl());
    map.addControl(new NavigationControl(), "top-left");
    map.addControl(
      new ScaleControl({
        maxWidth: 80,
        unit: "metric",
      })
    );
    map.addControl(
      new TerrainControl({
        source: "terrain",
      })
    );

    map.on("load", () => {
      map.addSource("satellite", {
        type: "raster",
        tiles: ["https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"],
        tileSize: 256,
      });

      map.addLayer({
        id: "satellite-layer",
        type: "raster",
        source: "satellite",
      });
    });
    map.on("style.load", () => {
      map.getStyle().layers.forEach((layer) => {
        map.setLayoutProperty(layer.id, "visibility", "none");
      });
    });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        map.setCenter([longitude, latitude]);
        new Marker({ color: "blue" })
          .setLngLat([longitude, latitude])
          .addTo(map);
      },
      (error) => {
        console.error("Location error:", error);
      },
      {
        enableHighAccuracy: false,
        // timeout: 10000,
      }
    );

    return () => {
      map.remove();
    };
  }, []);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const geojsonFile = files.find(
      (file) =>
        file.name.endsWith(".geojson") ||
        file.name.endsWith(".json") ||
        file.type === "application/geo+json" ||
        file.type === "application/json"
    );

    if (!geojsonFile) {
      alert("Please drop a valid GeoJSON file (.geojson or .json)");
      return;
    }

    try {
      const text = await geojsonFile.text();
      const geojson = JSON.parse(text);

      // Validate GeoJSON structure
      if (!geojson.type || !geojson.features) {
        alert("Invalid GeoJSON format");
        return;
      }

      const map = mapRef.current;
      if (!map) return;

      // Generate unique source and layer IDs
      const sourceId = `geojson-${Date.now()}`;
      const layerId = `geojson-layer-${Date.now()}`;

      // Add GeoJSON source
      map.addSource(sourceId, {
        type: "geojson",
        data: geojson,
      });

      // Add fill layer for polygons
      map.addLayer({
        id: `${layerId}-fill`,
        type: "fill",
        source: sourceId,
        paint: {
          "fill-color": "#088",
          "fill-opacity": 0.4,
        },
        filter: ["==", "$type", "Polygon"],
      });

      // Add line layer for lines and polygon outlines
      map.addLayer({
        id: `${layerId}-line`,
        type: "line",
        source: sourceId,
        paint: {
          "line-color": "#088",
          "line-width": 2,
        },
        filter: ["in", "$type", "LineString", "Polygon"],
      });

      // Add circle layer for points
      map.addLayer({
        id: `${layerId}-circle`,
        type: "circle",
        source: sourceId,
        paint: {
          "circle-radius": 6,
          "circle-color": "#088",
          "circle-stroke-width": 2,
          "circle-stroke-color": "#fff",
        },
        filter: ["==", "$type", "Point"],
      });

      // Fit map to GeoJSON bounds
      const bounds = new LngLatBounds();
      geojson.features.forEach(
        (feature: {
          geometry: {
            type: string;
            coordinates: number[] | number[][] | number[][][];
          };
        }) => {
          if (feature.geometry.type === "Point") {
            bounds.extend(feature.geometry.coordinates as [number, number]);
          } else if (feature.geometry.type === "LineString") {
            (feature.geometry.coordinates as number[][]).forEach((coord) =>
              bounds.extend(coord as [number, number])
            );
          } else if (feature.geometry.type === "Polygon") {
            (feature.geometry.coordinates as number[][][])[0].forEach((coord) =>
              bounds.extend(coord as [number, number])
            );
          }
        }
      );

      map.fitBounds(bounds, { padding: 50 });

      console.log(`GeoJSON loaded: ${geojsonFile.name}`);
    } catch (error) {
      console.error("Error loading GeoJSON:", error);
      alert("Failed to load GeoJSON file. Please check the file format.");
    }
  };

  return (
    <div
      id="map"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        border: isDragging
          ? "2px dashed var(--chakra-colors-blue-500)"
          : "none",
        transition: "border 0.2s ease",
      }}
    >
      {isDragging && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 136, 136, 0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              padding: "2rem",
              backgroundColor: "var(--chakra-colors-bg-panel)",
              borderRadius: "var(--chakra-radii-lg)",
              border: "2px dashed var(--chakra-colors-blue-500)",
              fontSize: "1.2rem",
              fontWeight: "600",
            }}
          >
            Drop GeoJSON file here
          </div>
        </div>
      )}
    </div>
  );
};

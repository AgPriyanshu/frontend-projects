import { Box } from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { useCallback, useEffect, useRef, useState } from "react";

import { LayerModel } from "../domain";
import { MapLibreAdapter } from "../engines/maplibre";
import { workspaceManager } from "../stores";

interface MapCanvasProps {
  /** Workspace ID this canvas belongs to. */
  workspaceId: string;
  /** Called when the adapter is mounted and ready. */
  onReady?: () => void;
}

/**
 * Map canvas component that mounts the MapLibre adapter.
 * Handles drag-and-drop for GeoJSON files and datasets.
 */
export const MapCanvas = observer(
  ({ workspaceId, onReady }: MapCanvasProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const adapterRef = useRef<MapLibreAdapter | null>(null);

    const [isDragging, setIsDragging] = useState(false);

    // Get or create the workspace.
    const workspace = workspaceManager.getOrCreateWorkspace(workspaceId);

    useEffect(() => {
      if (!containerRef.current) return;

      // Create and mount the adapter.
      const adapter = new MapLibreAdapter();
      adapterRef.current = adapter;

      adapter.mount(containerRef.current);

      // Wait for map to be ready, then bind stores.
      const checkReady = setInterval(() => {
        if (adapter.isReady()) {
          clearInterval(checkReady);
          workspace.bindAdapter(adapter);
          onReady?.();
        }
      }, 100);

      return () => {
        clearInterval(checkReady);
        adapter.destroy();
        adapterRef.current = null;
      };
    }, [workspace, onReady]);

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback(
      (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
      },
      []
    );

    const handleDrop = useCallback(
      async (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        // Check if it's a dataset node being dropped.
        const datasetId = e.dataTransfer.getData("application/dataset-id");

        if (datasetId) {
          // Handle dataset node drop.
          try {
            const response = await fetch(
              `${import.meta.env.VITE_API_BASE_URL}/web-gis/datasets/${datasetId}/download`,
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                },
              }
            );

            if (!response.ok) {
              throw new Error("Failed to download dataset");
            }

            const geojson = await response.json();

            // Validate GeoJSON structure.
            if (!geojson.type || !geojson.features) {
              alert("Invalid GeoJSON format");
              return;
            }

            loadGeoJSONAsLayer(geojson, `Dataset ${datasetId}`);
          } catch (error) {
            console.error("Error loading dataset:", error);
            alert("Failed to load dataset. Please try again.");
          }
          return;
        }

        // Handle file drop.
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

          // Validate GeoJSON structure.
          if (!geojson.type || !geojson.features) {
            alert("Invalid GeoJSON format");
            return;
          }

          loadGeoJSONAsLayer(geojson, geojsonFile.name);
        } catch (error) {
          console.error("Error loading GeoJSON:", error);
          alert("Failed to load GeoJSON file. Please check the file format.");
        }
      },
      [workspace]
    );

    const loadGeoJSONAsLayer = (geojson: GeoJSON.GeoJSON, name: string) => {
      const layerId = `layer-${Date.now()}`;

      const layer = new LayerModel({
        id: layerId,
        type: "geojson",
        name,
        source: geojson,
      });

      workspace.layerStore.addLayer(layer);
      workspace.layerStore.fitToLayer(layerId);

      console.log(`GeoJSON loaded as layer: ${name}`);
    };

    return (
      <Box
        ref={containerRef}
        w="100%"
        h="100%"
        position="relative"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        border={isDragging ? "2px dashed" : "none"}
        borderColor="blue.500"
        transition="border 0.2s ease"
      >
        {isDragging && (
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bg="rgba(0, 136, 136, 0.1)"
            display="flex"
            alignItems="center"
            justifyContent="center"
            zIndex={1000}
            pointerEvents="none"
          >
            <Box
              p="2rem"
              bg="bg.panel"
              borderRadius="lg"
              border="2px dashed"
              borderColor="blue.500"
              fontSize="1.2rem"
              fontWeight="600"
            >
              Drop GeoJSON file here
            </Box>
          </Box>
        )}
      </Box>
    );
  }
);

MapCanvas.displayName = "MapCanvas";

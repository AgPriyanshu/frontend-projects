import { Box } from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { useCallback, useEffect, useRef, useState } from "react";

import type { ApiResponse } from "api/types";
import type { LayerResponse } from "api/web-gis";
import { buildTileUrl, fetchLayerGeoJSON, useAddLayer } from "api/web-gis";
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
 * Handles drag-and-drop for dataset nodes from the data-sources panel.
 */
export const MapCanvas = observer(
  ({ workspaceId, onReady }: MapCanvasProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const adapterRef = useRef<MapLibreAdapter | null>(null);

    const [isDragging, setIsDragging] = useState(false);

    // Get or create the workspace.
    const workspace = workspaceManager.getOrCreateWorkspace(workspaceId);

    // API hooks.
    const { mutate: createLayer } = useAddLayer();

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

    /**
     * Fetches GeoJSON for a layer and adds it to the MobX LayerStore.
     */
    const fetchAndAddLayer = useCallback(
      async (apiLayer: LayerResponse) => {
        try {
          // Raster layers: use XYZ tile URL instead of GeoJSON.
          if (apiLayer.datasetType === "raster") {
            const tileUrl = buildTileUrl(apiLayer.source);
            const layer = new LayerModel({
              id: apiLayer.id,
              type: "raster",
              name: apiLayer.name,
              source: [tileUrl],
            });

            workspace.layerStore.addLayer(layer);

            // Fit to tileset bounds if available.
            if (apiLayer.tileset?.bounds) {
              workspace.layerStore.fitToBounds(
                apiLayer.tileset.bounds as [number, number, number, number]
              );
            }

            console.log(`Raster layer loaded on map: ${apiLayer.name}`);
            return;
          }

          // Vector/GeoJSON layers: fetch features.
          const geojson = await fetchLayerGeoJSON(apiLayer.id, apiLayer.source);

          // Skip if no features.
          if (!geojson?.features || geojson.features.length === 0) {
            console.warn(`No features found for layer ${apiLayer.name}`);
            return;
          }

          // Create LayerModel and add to store.
          const layer = new LayerModel({
            id: apiLayer.id,
            type: "geojson",
            name: apiLayer.name,
            source: geojson,
          });

          workspace.layerStore.addLayer(layer);
          workspace.layerStore.fitToLayer(apiLayer.id);

          console.log(`Layer loaded on map: ${apiLayer.name}`);
        } catch (err) {
          console.error(`Error loading layer ${apiLayer.name}:`, err);
        }
      },
      [workspace.layerStore]
    );

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
        const datasetName = e.dataTransfer.getData("application/dataset-name");

        if (datasetId) {
          // Handle dataset node drop — create layer via API, then load on map.
          createLayer(
            {
              name: datasetName || `Layer ${datasetId}`,
              source: datasetId,
            },
            {
              onSuccess: async (response) => {
                const apiLayer = (response.data as ApiResponse<LayerResponse>)
                  .data;
                await fetchAndAddLayer(apiLayer);
              },
              onError: (error) => {
                console.error("Error creating layer:", error);
                alert("Failed to create layer. Please try again.");
              },
            }
          );
          return;
        }
      },
      [workspace, createLayer, fetchAndAddLayer]
    );

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
              Drop dataset here to add as layer
            </Box>
          </Box>
        )}
      </Box>
    );
  }
);

MapCanvas.displayName = "MapCanvas";

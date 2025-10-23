import { useEffect, useRef } from "react";
import { observer } from "mobx-react-lite";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { MaplibreTerradrawControl } from "@watergis/maplibre-gl-terradraw";
import "@watergis/maplibre-gl-terradraw/dist/maplibre-gl-terradraw.css";
import { workspaceManager } from "./managers";
import "./map.css";

interface MapProps {
  center?: [number, number];
  zoom?: number;
  style?: string;
}

/**
 * Map Component - Main map renderer
 *
 * This component:
 * - Initializes the MapLibre instance
 * - Registers it with the workspaceManager
 * - Handles cleanup on unmount
 *
 * State is managed by workspaceManager (see store/map-store.ts)
 */
export const Map = observer(
  ({
    center,
    zoom,
    style = "https://demotiles.maplibre.org/style.json",
  }: MapProps) => {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<maplibregl.Map | null>(null);
    const draw = useRef<MaplibreTerradrawControl | null>(null);

    useEffect(() => {
      if (!mapContainer.current || map.current) return;

      // Use viewport store for initial position
      const initialCenter = center || workspaceManager.viewportManager.center;
      const initialZoom = zoom || workspaceManager.viewportManager.zoom;

      // Initialize map
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: style,
        center: initialCenter,
        zoom: initialZoom,
        bearing: workspaceManager.viewportManager.bearing,
        pitch: workspaceManager.viewportManager.pitch,
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

      // Register map instance with store (enables state sync)
      map.current.on("load", () => {
        if (map.current) {
          workspaceManager.setMapInstance(map.current);
        }
      });

      // Cleanup on unmount
      return () => {
        workspaceManager.clearMapInstance();
        map.current?.remove();
        map.current = null;
      };
    }, [center, zoom, style]);

    return (
      <div className="w-full h-full min-h-[600px] relative">
        <div
          ref={mapContainer}
          className="map absolute inset-0 h-full w-full"
        />

        {/* Loading indicator */}
        {workspaceManager.isLoading && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-card text-card-foreground px-4 py-2 rounded-lg border shadow-sm z-10">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">Loading map data...</span>
            </div>
          </div>
        )}

        {/* Error display */}
        {workspaceManager.error && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-destructive/10 text-destructive px-4 py-2 rounded-lg border border-destructive z-10">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Error:</span>
              <span className="text-sm">{workspaceManager.error}</span>
            </div>
          </div>
        )}

        {/* Debug info (remove in production) */}
        {process.env.NODE_ENV === "development" &&
          workspaceManager.isMapReady && (
            <div className="absolute bottom-4 left-4 bg-card/95 backdrop-blur-sm text-card-foreground px-3 py-2 rounded-lg border shadow-sm text-xs font-mono z-10">
              <div className="space-y-0.5">
                <div className="text-muted-foreground">
                  Zoom:{" "}
                  <span className="text-foreground">
                    {workspaceManager.viewportManager.zoom.toFixed(2)}
                  </span>
                </div>
                <div className="text-muted-foreground">
                  Center:{" "}
                  <span className="text-foreground">
                    [{workspaceManager.viewportManager.center[0].toFixed(4)},{" "}
                    {workspaceManager.viewportManager.center[1].toFixed(4)}]
                  </span>
                </div>
                <div className="text-muted-foreground">
                  Layers:{" "}
                  <span className="text-foreground">
                    {workspaceManager.stateManager.layerCount}
                  </span>{" "}
                  ({workspaceManager.stateManager.visibleLayerCount} visible)
                </div>
                <div className="text-muted-foreground">
                  Sources:{" "}
                  <span className="text-foreground">
                    {workspaceManager.stateManager.sourceCount}
                  </span>
                </div>
              </div>
            </div>
          )}
      </div>
    );
  }
);

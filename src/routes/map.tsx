import { LayerPanel } from "@/features/web-gis/layers/layer-panel";
import { workspaceManager } from "@/features/web-gis/managers";
import { Map } from "@/features/web-gis/map";
import { createFileRoute } from "@tanstack/react-router";
import { reaction } from "mobx";
import { useEffect } from "react";

export const Route = createFileRoute("/map")({
  component: MapPage,
});

function MapPage() {
  useEffect(() => {
    // Auto-load demo layers when map becomes ready
    const disposer = reaction(
      () => workspaceManager.isMapReady,
      (isReady) => {
        if (isReady && workspaceManager.stateManager.layerCount === 0) {
          // Only load if no layers exist
          setTimeout(() => {
            // loadDemoLayers();
          }, 100); // Small delay to ensure map is fully initialized
        }
      },
      { fireImmediately: true } // Check immediately on mount
    );

    return () => disposer();
  }, []);

  return (
    <div className="h-full flex flex-col">
      <h1 className="text-2xl font-bold mb-6">Interactive Map</h1>
      <div className="flex-1 flex gap-6 min-h-0">
        {/* Left sidebar with controls */}
        <div className="w-80 space-y-4 overflow-y-auto">
          <LayerPanel />
          {/* <ViewportControls /> */}
        </div>

        {/* Map */}
        <div className="flex-1 rounded-xl overflow-hidden border shadow-sm">
          <Map />
        </div>
      </div>
    </div>
  );
}

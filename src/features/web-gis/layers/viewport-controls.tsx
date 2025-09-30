/**
 * ViewportControls Component - Viewport state controls
 *
 * Demonstrates:
 * - Reading viewport state
 * - Controlling zoom, bearing, pitch
 * - Preset locations
 */

import { observer } from "mobx-react-lite";
import { workspaceManager } from "../managers";
import { ZoomIn, ZoomOut, Navigation, RotateCcw, Home } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const ViewportControls = observer(() => {
  const { viewportManager: viewport } = workspaceManager;

  const handleZoomIn = () => {
    viewport.zoomIn();
  };

  const handleZoomOut = () => {
    viewport.zoomOut();
  };

  const handleResetBearing = () => {
    viewport.resetBearing();
  };

  const handleResetPitch = () => {
    viewport.resetPitch();
  };

  const handleResetView = () => {
    viewport.reset();
  };

  const handleGoToIndia = () => {
    workspaceManager.flyTo([78.9629, 20.5937], 5, { duration: 2000 });
  };

  const handleGoToBangalore = () => {
    workspaceManager.flyTo([77.5946, 12.9716], 12, { duration: 1500 });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Viewport</CardTitle>
        <CardDescription>Camera position and controls</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current viewport state */}
        <div className="text-sm space-y-1">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Zoom:</span>
            <span className="font-mono">{viewport.zoom.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Center:</span>
            <span className="font-mono text-xs">
              [{viewport.center[0].toFixed(4)}, {viewport.center[1].toFixed(4)}]
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Bearing:</span>
            <span className="font-mono">{viewport.bearing.toFixed(1)}°</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Pitch:</span>
            <span className="font-mono">{viewport.pitch.toFixed(1)}°</span>
          </div>
        </div>

        {/* Zoom controls */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Zoom</p>
          <div className="flex gap-2">
            <Button
              onClick={handleZoomIn}
              disabled={viewport.isAtMaxZoom}
              className="flex-1"
              size="sm"
            >
              <ZoomIn size={16} />
              In
            </Button>
            <Button
              onClick={handleZoomOut}
              disabled={viewport.isAtMinZoom}
              className="flex-1"
              size="sm"
            >
              <ZoomOut size={16} />
              Out
            </Button>
          </div>
        </div>

        {/* Rotation controls */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Orientation</p>
          <div className="flex gap-2">
            <Button
              onClick={handleResetBearing}
              disabled={!viewport.isRotated}
              variant="secondary"
              className="flex-1"
              size="sm"
            >
              <Navigation size={16} />
              Bearing
            </Button>
            <Button
              onClick={handleResetPitch}
              disabled={!viewport.isTilted}
              variant="secondary"
              className="flex-1"
              size="sm"
            >
              <RotateCcw size={16} />
              Tilt
            </Button>
          </div>
        </div>

        {/* Preset locations */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Quick Locations</p>
          <div className="space-y-2">
            <Button
              onClick={handleGoToIndia}
              variant="outline"
              className="w-full"
              size="sm"
            >
              🇮🇳 Fly to India
            </Button>
            <Button
              onClick={handleGoToBangalore}
              variant="outline"
              className="w-full"
              size="sm"
            >
              🏙️ Fly to Bangalore
            </Button>
            <Button
              onClick={handleResetView}
              variant="destructive"
              className="w-full"
              size="sm"
            >
              <Home size={16} />
              Reset View
            </Button>
          </div>
        </div>

        {/* URL sharing */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Share</p>
          <div className="flex gap-2">
            <Input
              type="text"
              value={`${window.location.origin}?${viewport.toURLParams()}`}
              readOnly
              className="flex-1 text-xs"
            />
            <Button
              onClick={() => {
                navigator.clipboard.writeText(
                  `${window.location.origin}?${viewport.toURLParams()}`
                );
              }}
              size="sm"
            >
              Copy
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

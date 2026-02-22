import type { Map as MapLibreMap } from "maplibre-gl";
import {
  TerraDraw,
  TerraDrawPointMode,
  TerraDrawLineStringMode,
  TerraDrawPolygonMode,
  TerraDrawRectangleMode,
  TerraDrawCircleMode,
  TerraDrawFreehandMode,
  TerraDrawSelectMode,
  TerraDrawRenderMode,
} from "terra-draw";
import { TerraDrawMapLibreGLAdapter as TerraDrawMapLibreGLBridge } from "terra-draw-maplibre-gl-adapter";
import type { GeoJSON } from "geojson";

import type { DrawMode, Unsubscribe } from "../../domain";
import type { IDrawEngine } from "../ports";

/**
 * MapLibre implementation of IDrawEngine using Terra Draw.
 */
export class MapLibreDrawEngine implements IDrawEngine {
  private map: MapLibreMap | null = null;
  private draw: TerraDraw | null = null;
  private currentMode: DrawMode | null = null;
  private changeCallbacks: Set<(geometry: GeoJSON.FeatureCollection) => void> =
    new Set();

  /**
   * Binds the engine to a MapLibre map instance.
   */
  bind(map: MapLibreMap): void {
    this.map = map;
    this.initializeTerraDraw();
  }

  private initializeTerraDraw(): void {
    if (!this.map) return;

    const drawBridge = new TerraDrawMapLibreGLBridge({ map: this.map });

    this.draw = new TerraDraw({
      adapter: drawBridge,
      modes: [
        new TerraDrawPointMode(),
        new TerraDrawLineStringMode(),
        new TerraDrawPolygonMode(),
        new TerraDrawRectangleMode(),
        new TerraDrawCircleMode(),
        new TerraDrawFreehandMode(),
        new TerraDrawSelectMode({
          flags: {
            point: {
              feature: { draggable: true },
            },
            linestring: {
              feature: { draggable: true, coordinates: { deletable: true } },
            },
            polygon: {
              feature: { draggable: true, coordinates: { deletable: true } },
            },
            circle: {
              feature: { draggable: true },
            },
            rectangle: {
              feature: { draggable: true },
            },
            freehand: {
              feature: { draggable: true },
            },
          },
        }),
        new TerraDrawRenderMode({ modeName: "static" }),
      ],
    });

    this.draw.start();

    // Listen to change events.
    this.draw.on("change", () => {
      this.notifyChange();
    });

    this.draw.on("finish", () => {
      this.notifyChange();
    });
  }

  private notifyChange(): void {
    const features = this.getFeatures();
    this.changeCallbacks.forEach((cb) => cb(features));
  }

  setMode(mode: DrawMode | null): void {
    if (!this.draw) return;

    this.currentMode = mode;

    if (mode === null) {
      this.draw.setMode("static");
    } else {
      this.draw.setMode(mode);
    }
  }

  getMode(): DrawMode | null {
    return this.currentMode;
  }

  onChange(
    callback: (geometry: GeoJSON.FeatureCollection) => void
  ): Unsubscribe {
    this.changeCallbacks.add(callback);
    return () => {
      this.changeCallbacks.delete(callback);
    };
  }

  clear(): void {
    if (!this.draw) return;
    this.draw.clear();
    this.notifyChange();
  }

  getFeatures(): GeoJSON.FeatureCollection {
    if (!this.draw) {
      return { type: "FeatureCollection", features: [] };
    }

    const snapshot = this.draw.getSnapshot();
    return {
      type: "FeatureCollection",
      features: snapshot.map((feature) => ({
        type: "Feature" as const,
        geometry: feature.geometry,
        properties: feature.properties ?? {},
      })),
    };
  }

  /**
   * Cleans up the engine.
   */
  destroy(): void {
    if (this.draw) {
      this.draw.stop();
      this.draw = null;
    }
    this.changeCallbacks.clear();
    this.currentMode = null;
    this.map = null;
  }
}

/**
 * Demo data for WebGIS - Sample layers to demonstrate functionality
 */

import { workspaceManager } from "./managers";
import type { MapSource, MapLayer } from "./managers/types";

/**
 * Add demo layers to the map
 */
export function loadDemoLayers() {
  // Clear existing layers
  // workspaceManager.data.clear();

  // 1. India State Boundaries (Example GeoJSON)
  const indiaSource: MapSource = {
    id: "india-states",
    type: "geojson",
    data: {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {
            name: "Karnataka",
            population: 61095000,
          },
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [74.0, 12.0],
                [78.5, 12.0],
                [78.5, 18.5],
                [74.0, 18.5],
                [74.0, 12.0],
              ],
            ],
          },
        },
        {
          type: "Feature",
          properties: {
            name: "Maharashtra",
            population: 112374333,
          },
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [72.6, 15.6],
                [80.9, 15.6],
                [80.9, 22.0],
                [72.6, 22.0],
                [72.6, 15.6],
              ],
            ],
          },
        },
      ],
    },
  };

  const indiaLayer: MapLayer = {
    id: "india-states-fill",
    sourceId: "india-states",
    type: "fill",
    paint: {
      "fill-color": [
        "interpolate",
        ["linear"],
        ["get", "population"],
        0,
        "#ffffcc",
        50000000,
        "#a1dab4",
        100000000,
        "#41b6c4",
        150000000,
        "#225ea8",
      ],
      "fill-opacity": 0.6,
    },
    layout: {},
    visible: true,
    opacity: 1,
    metadata: {
      name: "State Population",
      description: "Population density by state",
      group: "demographics",
      legend: {
        type: "graduated",
        items: [
          { label: "0 - 50M", color: "#ffffcc" },
          { label: "50M - 100M", color: "#a1dab4" },
          { label: "100M+", color: "#225ea8" },
        ],
      },
    },
  };

  const indiaOutlineLayer: MapLayer = {
    id: "india-states-outline",
    sourceId: "india-states",
    type: "line",
    paint: {
      "line-color": "#000000",
      "line-width": 2,
    },
    layout: {},
    visible: true,
    opacity: 1,
    metadata: {
      name: "State Boundaries",
      description: "State outline borders",
      group: "boundaries",
    },
  };

  // Add all layers to the map store
  try {
    workspaceManager.stateManager.addSourceWithLayer(indiaSource, indiaLayer);
    workspaceManager.stateManager.addLayer(indiaOutlineLayer);

    console.log("✅ Demo layers loaded successfully");
  } catch (error) {
    console.error("Failed to load demo layers:", error);
  }
}

/**
 * Clear all demo layers
 */
export function clearDemoLayers() {
  workspaceManager.stateManager.clear();
}

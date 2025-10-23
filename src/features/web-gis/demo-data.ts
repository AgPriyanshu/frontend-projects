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

  // 2. Major Cities
  const citiesSource: MapSource = {
    id: "major-cities",
    type: "geojson",
    data: {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {
            name: "Bangalore",
            population: 12639000,
            type: "metro",
          },
          geometry: {
            type: "Point",
            coordinates: [77.5946, 12.9716],
          },
        },
        {
          type: "Feature",
          properties: {
            name: "Mumbai",
            population: 20411000,
            type: "metro",
          },
          geometry: {
            type: "Point",
            coordinates: [72.8777, 19.076],
          },
        },
        {
          type: "Feature",
          properties: {
            name: "Delhi",
            population: 32941000,
            type: "capital",
          },
          geometry: {
            type: "Point",
            coordinates: [77.209, 28.6139],
          },
        },
        {
          type: "Feature",
          properties: {
            name: "Chennai",
            population: 11503000,
            type: "metro",
          },
          geometry: {
            type: "Point",
            coordinates: [80.2707, 13.0827],
          },
        },
      ],
    },
  };

  const citiesLayer: MapLayer = {
    id: "cities-circles",
    sourceId: "major-cities",
    type: "circle",
    paint: {
      "circle-radius": [
        "interpolate",
        ["linear"],
        ["get", "population"],
        1000000,
        8,
        10000000,
        12,
        30000000,
        20,
      ],
      "circle-color": [
        "match",
        ["get", "type"],
        "capital",
        "#ff0000",
        "metro",
        "#0066ff",
        "#666666",
      ],
      "circle-stroke-color": "#ffffff",
      "circle-stroke-width": 2,
      "circle-opacity": 0.8,
    },
    layout: {},
    visible: true,
    opacity: 1,
    metadata: {
      name: "Major Cities",
      description: "Population centers",
      group: "cities",
      legend: {
        type: "categorical",
        items: [
          { label: "Capital", color: "#ff0000" },
          { label: "Metro", color: "#0066ff" },
        ],
      },
    },
  };

  const cityLabelsLayer: MapLayer = {
    id: "city-labels",
    sourceId: "major-cities",
    type: "symbol",
    paint: {
      "text-color": "#000000",
      "text-halo-color": "#ffffff",
      "text-halo-width": 2,
    },
    layout: {
      "text-field": ["get", "name"],
      "text-font": ["Open Sans Regular"],
      "text-size": 12,
      "text-offset": [0, 1.5],
      "text-anchor": "top",
    },
    visible: true,
    opacity: 1,
    metadata: {
      name: "City Labels",
      description: "City name labels",
      group: "cities",
    },
  };

  // Add all layers to the map store
  try {
    workspaceManager.stateManager.addSourceWithLayer(indiaSource, indiaLayer);
    workspaceManager.stateManager.addLayer(indiaOutlineLayer);
    // workspaceManager.data.addSourceWithLayer(citiesSource, citiesLayer);
    // workspaceManager.data.addLayer(cityLabelsLayer);

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

import type { Map as MapLibreMap } from "maplibre-gl";

const SATELLITE_TILES = "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}";

export const applySatelliteStyle = (map: MapLibreMap): void => {
  const firstLayerId = map.getStyle().layers[0]?.id;

  map.addSource("satellite", {
    type: "raster",
    tiles: [SATELLITE_TILES],
    tileSize: 256,
  });

  // Insert below all existing layers so programmatic layers render on top.
  map.addLayer(
    { id: "satellite-layer", type: "raster", source: "satellite" },
    firstLayerId
  );

  map.getStyle().layers.forEach((layer) => {
    if (layer.id !== "satellite-layer") {
      map.setLayoutProperty(layer.id, "visibility", "none");
    }
  });
};

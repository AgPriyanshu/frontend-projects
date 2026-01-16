import {
  FullscreenControl,
  GlobeControl,
  Map as MapLibre,
  Marker,
  NavigationControl,
  ScaleControl,
  TerrainControl,
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect } from "react";

export const Map = () => {
  useEffect(() => {
    const map = new MapLibre({
      container: "map",
      style: "https://demotiles.maplibre.org/globe.json",
      center: [78.9629, 20.5937],
      zoom: 2,
    });

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

        // Center map
        map.setCenter([longitude, latitude]);
        // map.setZoom(15);

        // Add marker
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

  return <div id="map" style={{ width: "100%", height: "100%" }}></div>;
};

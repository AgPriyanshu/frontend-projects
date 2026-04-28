import { Box } from "@chakra-ui/react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef } from "react";
import type { DsShop } from "api/dead-stock";
import { applySatelliteStyle } from "../../services/satellite-style";

interface StaticShopMapProps {
  shop: DsShop;
}

export const StaticShopMap = ({ shop }: StaticShopMapProps) => {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref.current || shop.lat === null || shop.lng === null) {
      return;
    }

    const map = new maplibregl.Map({
      container: ref.current,
      style: "https://demotiles.maplibre.org/style.json",
      center: [shop.lng, shop.lat],
      zoom: 13,
      interactive: false,
    });
    map.on("load", () => applySatelliteStyle(map));

    const marker = new maplibregl.Marker({ color: "#f59e0b" })
      .setLngLat([shop.lng, shop.lat])
      .addTo(map);

    return () => {
      marker.remove();
      map.remove();
    };
  }, [shop.lat, shop.lng]);

  if (shop.lat === null || shop.lng === null) {
    return null;
  }

  return <Box ref={ref} h="250px" borderRadius="md" overflow="hidden" />;
};

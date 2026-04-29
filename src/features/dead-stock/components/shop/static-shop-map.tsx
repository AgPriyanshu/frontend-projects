import { Box } from "@chakra-ui/react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef } from "react";
import type { DsShop } from "api/dead-stock";

interface StaticShopMapProps {
  shop: DsShop;
}

export const StaticShopMap = ({ shop }: StaticShopMapProps) => {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref.current || shop.lat === null || shop.lng === null) return;

    const map = new maplibregl.Map({
      container: ref.current,
      style: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
      center: [shop.lng, shop.lat],
      zoom: 15,
      interactive: false,
      attributionControl: false,
    });

    const addressLabel = [shop.address, shop.city, shop.pincode]
      .filter(Boolean)
      .join(", ");

    const popup = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false,
      anchor: "bottom",
      offset: [0, -48],
      maxWidth: "240px",
    })
      .setHTML(
        `<span style="font-size:12px;font-weight:500;color:#111;">${addressLabel || shop.name}</span>`
      )
      .setLngLat([shop.lng, shop.lat]);

    const marker = new maplibregl.Marker({ color: "#f59e0b" })
      .setLngLat([shop.lng, shop.lat])
      .addTo(map);

    map.on("load", () => popup.addTo(map));

    return () => {
      popup.remove();
      marker.remove();
      map.remove();
    };
  }, [shop.lat, shop.lng, shop.address, shop.city, shop.pincode, shop.name]);

  if (shop.lat === null || shop.lng === null) return null;

  return <Box ref={ref} h="220px" borderRadius="md" overflow="hidden" />;
};

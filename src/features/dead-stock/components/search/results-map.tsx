import { Box, Button } from "@chakra-ui/react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef, useState } from "react";
import type { DsSearchItem } from "api/dead-stock";
import { applySatelliteStyle } from "../../services/satellite-style";
import {
  mountShopMarkers,
  shopMarkerLayerIds,
} from "../../services/shop-marker-layer";
import { ResultCard } from "./result-card";

interface ResultsMapProps {
  items: DsSearchItem[];
  lat?: number;
  lng?: number;
  radiusKm?: number;
  isVisible: boolean;
  onSearchArea: (params: {
    lat: number;
    lng: number;
    radiusKm: number;
  }) => void;
}

const distanceKm = (
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
) => {
  const earthKm = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * earthKm * Math.asin(Math.sqrt(h));
};

export const ResultsMap = ({
  items,
  lat,
  lng,
  isVisible,
  onSearchArea,
}: ResultsMapProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const itemsRef = useRef(items);
  const initialLatRef = useRef(lat);
  const initialLngRef = useRef(lng);
  const [selectedItem, setSelectedItem] = useState<DsSearchItem | null>(null);
  const [showSearchArea, setShowSearchArea] = useState(false);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) {
      return;
    }

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: "https://demotiles.maplibre.org/style.json",
      center: [
        initialLngRef.current ?? 77.209,
        initialLatRef.current ?? 28.6139,
      ],
      zoom: initialLatRef.current && initialLngRef.current ? 11 : 4,
    });
    mapRef.current = map;

    map.on("load", () => {
      applySatelliteStyle(map);
      mountShopMarkers(map, itemsRef.current);
      map.on("moveend", () => setShowSearchArea(true));
      map.on("click", shopMarkerLayerIds.points, (event) => {
        const itemId = event.features?.[0]?.properties?.itemId;
        const item = itemsRef.current.find(
          (candidate) => candidate.id === itemId
        );
        if (item) {
          setSelectedItem(item);
        }
      });
      map.on("click", shopMarkerLayerIds.clusters, async (event) => {
        const feature = event.features?.[0];
        const clusterId = feature?.properties?.cluster_id;
        const source = map.getSource(shopMarkerLayerIds.source) as
          | maplibregl.GeoJSONSource
          | undefined;
        if (!source || clusterId === undefined || !feature?.geometry) {
          return;
        }
        const zoom = await source.getClusterExpansionZoom(clusterId);
        const coordinates = (feature.geometry as GeoJSON.Point).coordinates as [
          number,
          number,
        ];
        map.easeTo({ center: coordinates, zoom });
      });
      map.on("click", (event) => {
        const features = map.queryRenderedFeatures(event.point, {
          layers: [shopMarkerLayerIds.points, shopMarkerLayerIds.clusters],
        });
        if (features.length === 0) {
          setSelectedItem(null);
        }
      });
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) {
      return;
    }
    if (map.isStyleLoaded()) {
      mountShopMarkers(map, items);
    } else {
      map.once("load", () => mountShopMarkers(map, items));
    }
  }, [items]);

  useEffect(() => {
    if (isVisible) {
      window.setTimeout(() => mapRef.current?.resize(), 0);
    }
  }, [isVisible]);

  const handleSearchArea = () => {
    const map = mapRef.current;
    if (!map) {
      return;
    }
    const center = map.getCenter();
    const bounds = map.getBounds();
    const radiusKm = Math.ceil(
      Math.max(
        distanceKm(center, bounds.getNorthEast()),
        distanceKm(center, bounds.getSouthWest())
      )
    );
    setShowSearchArea(false);
    onSearchArea({ lat: center.lat, lng: center.lng, radiusKm });
  };

  return (
    <Box position="relative" h={{ base: "70vh", md: "680px" }}>
      <Box ref={containerRef} h="full" borderRadius="md" overflow="hidden" />
      {showSearchArea && (
        <Button
          position="absolute"
          top={4}
          left="50%"
          transform="translateX(-50%)"
          onClick={handleSearchArea}
        >
          Search this area
        </Button>
      )}
      {selectedItem && (
        <Box position="absolute" left={4} right={4} bottom={4}>
          <ResultCard item={selectedItem} compact />
        </Box>
      )}
    </Box>
  );
};

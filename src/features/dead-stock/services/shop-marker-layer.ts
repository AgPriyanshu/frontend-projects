import type { GeoJSONSource, Map as MapLibreMap } from "maplibre-gl";
import type { DsSearchItem } from "api/dead-stock";

const SOURCE_ID = "dead-stock-shops";
const CLUSTERS_ID = "dead-stock-shop-clusters";
const CLUSTER_COUNT_ID = "dead-stock-shop-cluster-count";
const POINTS_ID = "dead-stock-shop-points";

export const shopMarkerLayerIds = {
  source: SOURCE_ID,
  clusters: CLUSTERS_ID,
  clusterCount: CLUSTER_COUNT_ID,
  points: POINTS_ID,
};

export const toShopFeatureCollection = (items: DsSearchItem[]) => ({
  type: "FeatureCollection" as const,
  features: items
    .filter((item) => item.shopLat !== null && item.shopLng !== null)
    .map((item) => ({
      type: "Feature" as const,
      properties: {
        itemId: item.id,
        shopId: item.shop,
        title: item.shopName,
      },
      geometry: {
        type: "Point" as const,
        coordinates: [item.shopLng as number, item.shopLat as number],
      },
    })),
});

export const mountShopMarkers = (map: MapLibreMap, items: DsSearchItem[]) => {
  const data = toShopFeatureCollection(items);
  const existingSource = map.getSource(SOURCE_ID) as GeoJSONSource | undefined;

  if (existingSource) {
    existingSource.setData(data);
    return;
  }

  map.addSource(SOURCE_ID, {
    type: "geojson",
    data,
    cluster: true,
    clusterRadius: 50,
    clusterMaxZoom: 14,
  });

  map.addLayer({
    id: CLUSTERS_ID,
    type: "circle",
    source: SOURCE_ID,
    filter: ["has", "point_count"],
    paint: {
      "circle-color": "#0f766e",
      "circle-radius": ["step", ["get", "point_count"], 18, 20, 24, 100, 32],
      "circle-opacity": 0.9,
    },
  });

  map.addLayer({
    id: CLUSTER_COUNT_ID,
    type: "symbol",
    source: SOURCE_ID,
    filter: ["has", "point_count"],
    layout: {
      "text-field": ["get", "point_count_abbreviated"],
      "text-size": 12,
    },
    paint: { "text-color": "#ffffff" },
  });

  map.addLayer({
    id: POINTS_ID,
    type: "circle",
    source: SOURCE_ID,
    filter: ["!", ["has", "point_count"]],
    paint: {
      "circle-color": "#f59e0b",
      "circle-radius": 9,
      "circle-stroke-width": 2,
      "circle-stroke-color": "#ffffff",
    },
  });
};

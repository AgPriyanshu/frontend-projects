import http from "k6/http";
import { check, sleep } from "k6";
import { Rate } from "k6/metrics";

const errorRate = new Rate("errors");

export const options = {
  vus: 100,
  duration: "60s",
  thresholds: {
    http_req_duration: ["p(95)<300"],
    errors: ["rate<0.01"],
  },
};

const BASE = __ENV.BASE_URL || "http://localhost:8000";

const QUERIES = [
  "hammer",
  "pipe",
  "wire",
  "cement",
  "drill",
  "bulb",
  "fan",
  "paint",
];

export default function () {
  const lat = 28.4 + Math.random() * 0.5;
  const lng = 76.8 + Math.random() * 0.6;
  const q = QUERIES[Math.floor(Math.random() * QUERIES.length)];

  const res = http.get(
    `${BASE}/dead-stock/search/items/?lat=${lat}&lng=${lng}&radius_km=5&q=${q}`,
    { tags: { name: "ds-search" } }
  );

  const ok = check(res, {
    "status 200": (r) => r.status === 200,
    "has items": (r) => {
      try {
        const body = JSON.parse(r.body);
        return Array.isArray(body?.data?.items);
      } catch {
        return false;
      }
    },
  });

  errorRate.add(!ok);
  sleep(0.1);
}

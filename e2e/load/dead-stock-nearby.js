import http from "k6/http";
import { check, sleep } from "k6";
import { Rate } from "k6/metrics";

const errorRate = new Rate("errors");

export const options = {
  vus: 100,
  duration: "60s",
  thresholds: {
    http_req_duration: ["p(95)<100"],
    errors: ["rate<0.01"],
  },
};

const BASE = __ENV.BASE_URL || "http://localhost:8000";

export default function () {
  const lat = 28.4 + Math.random() * 0.5;
  const lng = 76.8 + Math.random() * 0.6;

  const res = http.get(
    `${BASE}/dead-stock/shops/nearby/?lat=${lat}&lng=${lng}&radius_km=5`,
    { tags: { name: "ds-nearby" } }
  );

  const ok = check(res, {
    "status 200": (r) => r.status === 200,
    "has shops": (r) => {
      try {
        return Array.isArray(JSON.parse(r.body)?.data?.shops);
      } catch {
        return false;
      }
    },
  });

  errorRate.add(!ok);
  sleep(0.1);
}

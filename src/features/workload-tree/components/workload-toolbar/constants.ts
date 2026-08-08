import type { FilterStatus } from "./workload-toolbar";

export const filterOptions: { label: string; value: FilterStatus }[] = [
  { label: "All", value: "ALL" },
  { label: "Under", value: "UNDER" },
  { label: "Healthy", value: "HEALTHY" },
  { label: "Overloaded", value: "OVER" },
];

import type { DsSearchItem } from "api/dead-stock";
import { ResultCard } from "./result-card";

interface MarkerPopupProps {
  item: DsSearchItem;
}

export const MarkerPopup = ({ item }: MarkerPopupProps) => (
  <ResultCard item={item} compact />
);

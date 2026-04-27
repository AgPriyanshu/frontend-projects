import { Badge } from "@chakra-ui/react";
import type { DsItem } from "api/dead-stock";

export const StatusBadge = ({ item }: { item: DsItem }) => {
  if (item.status === "hidden") {
    return <Badge colorPalette="gray">Hidden</Badge>;
  }

  const now = new Date();
  const staleAt = new Date(item.staleAt);
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  if (staleAt < now) {
    return <Badge colorPalette="red">Stale — refresh to publish</Badge>;
  }

  if (staleAt < sevenDaysFromNow) {
    return <Badge colorPalette="orange">Refresh soon</Badge>;
  }

  return <Badge colorPalette="green">Active</Badge>;
};

import { Badge } from "@chakra-ui/react";
import type { DsItem } from "api/dead-stock";

export const StatusBadge = ({ item }: { item: DsItem }) => {
  if (item.status === "hidden") {
    return (
      <Badge bg="surface.disabled" color="text.muted" border="none">
        Hidden
      </Badge>
    );
  }

  const now = new Date();
  const staleAt = new Date(item.staleAt);
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  if (staleAt < now) {
    return (
      <Badge bg="intent.danger" color="text.onIntent" border="none">
        Stale — refresh to publish
      </Badge>
    );
  }

  if (staleAt < sevenDaysFromNow) {
    return (
      <Badge bg="intent.warning" color="text.onIntent" border="none">
        Refresh soon
      </Badge>
    );
  }

  return (
    <Badge bg="intent.success" color="text.onIntent" border="none">
      Active
    </Badge>
  );
};

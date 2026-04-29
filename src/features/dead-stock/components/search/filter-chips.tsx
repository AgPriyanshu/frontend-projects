import { Badge, Button, HStack } from "@chakra-ui/react";
import { FiMapPin } from "react-icons/fi";
import type { DsCategory, DsSearchParams, DsSort } from "api/dead-stock";

interface FilterChipsProps {
  params: DsSearchParams;
  categories: DsCategory[];
  onChange: (patch: Partial<DsSearchParams>) => void;
  locationLabel?: string;
  onEditLocation?: () => void;
}

const DISTANCES = [1, 5, 10, 25];

const selectStyle: React.CSSProperties = {
  padding: "5px 10px",
  borderRadius: 6,
  border: "1px solid var(--chakra-colors-border-default)",
  background: "var(--chakra-colors-bg-panel)",
  color: "var(--chakra-colors-fg)",
  fontSize: "var(--chakra-font-sizes-sm)",
  cursor: "pointer",
  outline: "none",
};

export const FilterChips = ({
  params,
  categories,
  onChange,
  locationLabel,
  onEditLocation,
}: FilterChipsProps) => (
  <HStack gap={2} overflowX="auto" pb={1} align="center" flexShrink={0}>
    {locationLabel && (
      <Badge
        variant="outline"
        gap={1}
        flexShrink={0}
        cursor="pointer"
        onClick={onEditLocation}
        _hover={{ bg: "bg.muted" }}
        userSelect="none"
      >
        <FiMapPin />
        {locationLabel}
      </Badge>
    )}

    {DISTANCES.map((distance) => (
      <Button
        key={distance}
        size="xs"
        variant={params.radiusKm === distance ? "solid" : "outline"}
        onClick={() => onChange({ radiusKm: distance })}
        flexShrink={0}
      >
        {distance}km
      </Button>
    ))}

    <select
      value={params.category || ""}
      onChange={(event) =>
        onChange({ category: event.target.value || undefined })
      }
      style={{ ...selectStyle, minWidth: 140 }}
    >
      <option value="">All categories</option>
      {categories.map((category) => (
        <option key={category.id} value={category.slug}>
          {category.name}
        </option>
      ))}
    </select>

    <select
      value={params.sort || "distance"}
      onChange={(event) => onChange({ sort: event.target.value as DsSort })}
      style={{ ...selectStyle, minWidth: 120 }}
    >
      <option value="distance">Nearest first</option>
      <option value="recent">Newest first</option>
      <option value="price">Lowest price</option>
    </select>
  </HStack>
);

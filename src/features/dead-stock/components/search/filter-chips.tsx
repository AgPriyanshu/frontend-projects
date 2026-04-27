import { Button, HStack, Input, Text } from "@chakra-ui/react";
import type { DsCategory, DsSearchParams, DsSort } from "api/dead-stock";

interface FilterChipsProps {
  params: DsSearchParams;
  categories: DsCategory[];
  onChange: (patch: Partial<DsSearchParams>) => void;
}

const DISTANCES = [1, 5, 10, 25];
const SORTS: { label: string; value: DsSort }[] = [
  { label: "Distance", value: "distance" },
  { label: "Newest", value: "recent" },
  { label: "Price", value: "price" },
];

export const FilterChips = ({
  params,
  categories,
  onChange,
}: FilterChipsProps) => (
  <HStack gap={2} overflowX="auto" pb={1} align="center">
    <Text fontSize="sm" color="text.secondary" flexShrink={0}>
      Filters
    </Text>
    {DISTANCES.map((distance) => (
      <Button
        key={distance}
        size="sm"
        variant={params.radiusKm === distance ? "solid" : "outline"}
        onClick={() => onChange({ radiusKm: distance })}
      >
        {distance}km
      </Button>
    ))}
    <select
      value={params.category || ""}
      onChange={(event) =>
        onChange({ category: event.target.value || undefined })
      }
      style={{
        minWidth: 150,
        padding: "7px 10px",
        borderRadius: 6,
        border: "1px solid var(--chakra-colors-border-default)",
        background: "var(--chakra-colors-bg-panel)",
      }}
    >
      <option value="">All categories</option>
      {categories.map((category) => (
        <option key={category.id} value={category.slug}>
          {category.name}
        </option>
      ))}
    </select>
    <Input
      size="sm"
      type="number"
      min={0}
      placeholder="Min ₹"
      value={params.minPrice ?? ""}
      onChange={(event) =>
        onChange({
          minPrice: event.target.value ? Number(event.target.value) : undefined,
        })
      }
      w="100px"
      flexShrink={0}
    />
    <Input
      size="sm"
      type="number"
      min={0}
      placeholder="Max ₹"
      value={params.maxPrice ?? ""}
      onChange={(event) =>
        onChange({
          maxPrice: event.target.value ? Number(event.target.value) : undefined,
        })
      }
      w="100px"
      flexShrink={0}
    />
    {SORTS.map((sort) => (
      <Button
        key={sort.value}
        size="sm"
        variant={
          (params.sort || "distance") === sort.value ? "solid" : "outline"
        }
        onClick={() => onChange({ sort: sort.value })}
      >
        Sort: {sort.label}
      </Button>
    ))}
  </HStack>
);

import {
  Badge,
  Box,
  Button,
  HStack,
  Link as ChakraLink,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useCallback, useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router";
import type { DsSearchParams } from "api/dead-stock";
import { useCategories, useSearchItems } from "api/dead-stock";
import { useBuyerLocation } from "../../hooks/use-buyer-location";
import { ViewToggle, type SearchView } from "./_view-toggle";
import { FilterChips } from "./filter-chips";
import { ResultsList } from "./results-list";
import { ResultsMap } from "./results-map";
import { SearchBar } from "./search-bar";
import { flattenResults } from "./search-utils";

const numberParam = (value: string | null) =>
  value === null || value === "" ? undefined : Number(value);

export const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const buyerLocation = useBuyerLocation();
  const { data: categories = [] } = useCategories();

  const view = (searchParams.get("view") || "list") as SearchView;
  const params: DsSearchParams = useMemo(
    () => ({
      q: searchParams.get("q") || undefined,
      lat: numberParam(searchParams.get("lat")),
      lng: numberParam(searchParams.get("lng")),
      radiusKm: numberParam(searchParams.get("radiusKm")) ?? 5,
      category: searchParams.get("category") || undefined,
      minPrice: numberParam(searchParams.get("minPrice")),
      maxPrice: numberParam(searchParams.get("maxPrice")),
      sort: (searchParams.get("sort") as DsSearchParams["sort"]) || "distance",
    }),
    [searchParams]
  );

  useEffect(() => {
    if (
      !buyerLocation.isLoading &&
      buyerLocation.lat !== null &&
      buyerLocation.lng !== null &&
      !searchParams.get("lat") &&
      !searchParams.get("lng")
    ) {
      const next = new URLSearchParams(searchParams);
      next.set("lat", String(buyerLocation.lat));
      next.set("lng", String(buyerLocation.lng));
      next.set("radiusKm", next.get("radiusKm") || "5");
      setSearchParams(next, { replace: true });
    }
  }, [buyerLocation, searchParams, setSearchParams]);

  const updateParams = useCallback(
    (patch: Partial<DsSearchParams> & { view?: SearchView }) => {
      const next = new URLSearchParams(searchParams);
      Object.entries(patch).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "") {
          next.delete(key);
        } else {
          next.set(key, String(value));
        }
      });
      setSearchParams(next);
    },
    [searchParams, setSearchParams]
  );

  const searchQuery = useSearchItems(params);
  const items = flattenResults(searchQuery.data?.pages);

  return (
    <VStack align="stretch" gap={5}>
      <Box
        position="sticky"
        top={0}
        zIndex={5}
        bg="bg.canvas"
        py={3}
        borderBottomWidth="1px"
        borderColor="border.default"
      >
        <VStack align="stretch" gap={3}>
          <HStack justify="space-between" gap={4} align="center" wrap="wrap">
            <Box flex={1} minW={{ base: "100%", md: "420px" }}>
              <SearchBar
                value={params.q || ""}
                onChange={(q) => updateParams({ q: q || undefined })}
              />
            </Box>
            <ViewToggle
              value={view}
              onChange={(nextView) => updateParams({ view: nextView })}
            />
          </HStack>
          <HStack justify="space-between" gap={3} wrap="wrap">
            <Badge variant="subtle">
              Searching in {params.radiusKm || 5}km of {buyerLocation.label}
            </Badge>
            <ChakraLink asChild fontSize="sm">
              <Link to="/dead-stock/owner/onboarding">
                Log in to save searches
              </Link>
            </ChakraLink>
          </HStack>
          <FilterChips
            params={params}
            categories={categories}
            onChange={updateParams}
          />
        </VStack>
      </Box>

      {searchQuery.isError && (
        <Text color="intent.danger">Search failed. Try again.</Text>
      )}

      <Box display={view === "list" ? "block" : "none"}>
        <ResultsList
          query={searchQuery}
          radiusKm={params.radiusKm || 5}
          onExpandRadius={() => updateParams({ radiusKm: 10 })}
        />
      </Box>
      <Box display={view === "map" ? "block" : "none"}>
        <ResultsMap
          items={items}
          lat={params.lat}
          lng={params.lng}
          radiusKm={params.radiusKm}
          isVisible={view === "map"}
          onSearchArea={(area) => updateParams(area)}
        />
      </Box>
      {view === "map" && items.length === 0 && !searchQuery.isLoading && (
        <Button onClick={() => updateParams({ radiusKm: 10 })}>
          Expand to 10km
        </Button>
      )}
    </VStack>
  );
};

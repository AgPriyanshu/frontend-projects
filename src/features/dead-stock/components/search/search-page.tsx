import { Box, Button, HStack, Text, VStack } from "@chakra-ui/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import type { DsSearchParams } from "api/dead-stock";
import { useCategories, useSearchItems } from "api/dead-stock";
import { useBuyerLocation } from "../../hooks/use-buyer-location";
import { ViewToggle, type SearchView } from "./_view-toggle";
import { FilterChips } from "./filter-chips";
import { LocationPickerDialog } from "./location-picker-dialog";
import { ResultsList } from "./results-list";
import { ResultsMap } from "./results-map";
import { SearchBar } from "./search-bar";
import { ShopSignupDialog } from "./shop-signup-dialog";
import { flattenResults } from "./search-utils";

const numberParam = (value: string | null) =>
  value === null || value === "" ? undefined : Number(value);

export const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const buyerLocation = useBuyerLocation();
  const { data: categories = [] } = useCategories();
  const navigate = useNavigate();
  const [locationPickerOpen, setLocationPickerOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);
  const [customLocationLabel, setCustomLocationLabel] = useState<string | null>(
    null
  );

  const view = (searchParams.get("view") || "map") as SearchView;
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

  const handleLocationConfirm = useCallback(
    async ({ lat, lng }: { lat: number; lng: number }) => {
      updateParams({ lat, lng });
      setCustomLocationLabel("Custom location");
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=14`,
          { headers: { "Accept-Language": "en" } }
        );
        const data = (await response.json()) as {
          address?: {
            suburb?: string;
            neighbourhood?: string;
            city_district?: string;
            city?: string;
            town?: string;
            village?: string;
          };
        };
        const addr = data.address ?? {};
        const label =
          addr.suburb ??
          addr.neighbourhood ??
          addr.city_district ??
          addr.city ??
          addr.town ??
          addr.village ??
          "Custom location";
        setCustomLocationLabel(label);
      } catch {
        // Keep "Custom location" as fallback.
      }
    },
    [updateParams]
  );

  const searchQuery = useSearchItems(params);
  const items = flattenResults(searchQuery.data?.pages);

  const locationLabel =
    customLocationLabel ??
    (!buyerLocation.isLoading ? buyerLocation.label : undefined);

  return (
    <VStack className="search-page" align="stretch" gap={0} h="full">
      <Box
        position="sticky"
        top={0}
        zIndex={5}
        bg="surface.page"
        borderBottomWidth="1px"
        borderColor="border.default"
        px={4}
        py={3}
      >
        <HStack justify="space-between" align="flex-start" wrap="wrap" gap={4}>
          <VStack align="stretch" gap={2} maxW="2xl" flex={1}>
            <HStack gap={3} align="center">
              <Box flex={1}>
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
            <FilterChips
              params={params}
              categories={categories}
              onChange={updateParams}
              locationLabel={locationLabel}
              onEditLocation={() => setLocationPickerOpen(true)}
            />
          </VStack>

          <VStack gap={1} align="end" flexShrink={0} pt={1}>
            <Text fontSize="xs" color="fg.muted" whiteSpace="nowrap">
              Shop owner?
            </Text>
            <HStack gap={2}>
              <Button
                size="xs"
                variant="outline"
                onClick={() => setSignupOpen(true)}
              >
                Sign up
              </Button>
              <Button size="xs" onClick={() => navigate("/dead-stock/login")}>
                Login
              </Button>
            </HStack>
          </VStack>
        </HStack>
      </Box>

      <Box
        flex={1}
        minH={0}
        overflow="hidden"
        px={view === "map" ? 0 : 4}
        py={view === "map" ? 0 : 4}
      >
        <Box
          display={view === "list" ? "block" : "none"}
          h="full"
          overflowY="auto"
        >
          <ResultsList
            query={searchQuery}
            radiusKm={params.radiusKm || 5}
            onExpandRadius={() => updateParams({ radiusKm: 10 })}
          />
        </Box>
        <Box display={view === "map" ? "block" : "none"} h="full">
          <ResultsMap
            items={items}
            lat={params.lat}
            lng={params.lng}
            myLat={buyerLocation.lat}
            myLng={buyerLocation.lng}
            radiusKm={params.radiusKm}
            isVisible={view === "map"}
            hasQuery={!!params.q}
            onSearchArea={(area) => updateParams(area)}
          />
        </Box>
      </Box>

      <LocationPickerDialog
        isOpen={locationPickerOpen}
        currentLat={params.lat}
        currentLng={params.lng}
        onClose={() => setLocationPickerOpen(false)}
        onConfirm={handleLocationConfirm}
      />
      <ShopSignupDialog
        isOpen={signupOpen}
        onClose={() => setSignupOpen(false)}
      />
    </VStack>
  );
};

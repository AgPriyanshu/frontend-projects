import { Box, Button, Center, Heading, Text, VStack } from "@chakra-ui/react";
import { useCreateShop } from "api/dead-stock";
import { RoutePath } from "app/router/constants";
import { observer } from "mobx-react-lite";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { workspaceManager } from "shared/map/stores";
import type { ShopDetails } from "../../../hooks/use-onboarding-state";

const WORKSPACE_ID = "ds-location-picker";
const INDIA_CENTER: [number, number] = [78.9629, 20.5937];
const INDIA_ZOOM = 5;
const PIN_ZOOM = 16;

interface LocationStepProps {
  shopDetails: ShopDetails;
}

export const LocationStep = observer(({ shopDetails }: LocationStepProps) => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const workspace = workspaceManager.getOrCreateWorkspace(WORKSPACE_ID);
  const { mutate: createShop, isPending } = useCreateShop();

  useEffect(() => {
    if (!containerRef.current) return;

    const mapManager = workspace.getMapManager();
    mapManager.mount(containerRef.current);

    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        workspace.mapStore.flyTo(
          [pos.coords.longitude, pos.coords.latitude],
          PIN_ZOOM
        );
      },
      () => {
        workspace.mapStore.flyTo(INDIA_CENTER, INDIA_ZOOM);
      }
    );

    return () => {
      workspaceManager.closeWorkspace(WORKSPACE_ID);
    };
  }, [workspace]);

  const handleGps = () => {
    navigator.geolocation?.getCurrentPosition((pos) => {
      workspace.mapStore.flyTo(
        [pos.coords.longitude, pos.coords.latitude],
        PIN_ZOOM
      );
    });
  };

  const handleConfirm = () => {
    const [lng, lat] = workspace.mapStore.view.center;
    createShop(
      {
        name: shopDetails.name,
        phone: shopDetails.whatsapp,
        latitude: lat,
        longitude: lng,
      },
      {
        onSuccess: () => {
          navigate(`${RoutePath.DeadStock}/owner/inventory`, { replace: true });
        },
      }
    );
  };

  return (
    <VStack className="location-step" gap={4} w="full" maxW="sm" mx="auto">
      <VStack gap={1} w="full">
        <Heading size="lg" textAlign="center">
          Pin your location
        </Heading>
        <Text color="text.secondary" textAlign="center" fontSize="sm">
          Move the map so the pin sits on your shop.
        </Text>
      </VStack>

      <Box
        position="relative"
        w="full"
        h="64"
        borderRadius="xl"
        overflow="hidden"
      >
        <Box
          ref={containerRef}
          className="location-picker-map"
          w="full"
          h="full"
        />
        <Center
          className="location-picker-crosshair"
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          pointerEvents="none"
          zIndex={10}
        >
          <Box transform="translateY(-14px)">
            <svg width="32" height="40" viewBox="0 0 32 40">
              <path
                d="M16 0C7.163 0 0 7.163 0 16c0 10 16 24 16 24s16-14 16-24C32 7.163 24.837 0 16 0z"
                fill="#E53E3E"
              />
              <circle cx="16" cy="16" r="6" fill="white" />
            </svg>
          </Box>
        </Center>
      </Box>

      <Button size="sm" variant="outline" onClick={handleGps} w="full">
        Use my current location
      </Button>

      <Button
        w="full"
        bg="intent.primary"
        color="text.onIntent"
        onClick={handleConfirm}
        loading={isPending}
        disabled={isPending}
      >
        Confirm — create shop
      </Button>
    </VStack>
  );
});

LocationStep.displayName = "LocationStep";

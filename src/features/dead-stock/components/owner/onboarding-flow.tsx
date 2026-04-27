import {
  Box,
  Button,
  Center,
  Flex,
  Heading,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useMyShop } from "api/dead-stock";
import { queryClient } from "api/query-client";
import { RoutePath } from "app/router/constants";
import { clearToken } from "shared/local-storage";
import { useNavigate } from "react-router";
import type { ShopDetails } from "../../hooks/use-onboarding-state";
import { useOnboardingState } from "../../hooks/use-onboarding-state";
import { PhoneStep } from "./steps/phone-step";
import { ShopDetailsStep } from "./steps/shop-details-step";

const STEP_LABELS = ["Phone", "Shop details", "Location"];

const StepBar = ({ current }: { current: number }) => (
  <Flex className="ds-step-bar" gap={2} w="full" maxW="sm" mx="auto">
    {STEP_LABELS.map((label, i) => (
      <Box key={label} flex={1} textAlign="center">
        <Box
          h={1}
          borderRadius="full"
          bg={i <= current ? "intent.primary" : "border.default"}
          mb={1}
          transition="background 0.2s"
        />
        <Text
          fontSize="xs"
          color={i <= current ? "intent.primary" : "text.muted"}
        >
          {label}
        </Text>
      </Box>
    ))}
  </Flex>
);

const LocationPlaceholder = ({ shopDetails }: { shopDetails: ShopDetails }) => (
  <VStack
    className="ds-location-placeholder"
    gap={4}
    w="full"
    maxW="sm"
    mx="auto"
  >
    <Heading size="md" textAlign="center">
      Pin your location
    </Heading>
    <Text color="text.secondary" fontSize="sm" textAlign="center">
      Map picker coming in the next step. Your shop details are saved:
    </Text>
    <Box p={4} borderWidth={1} borderRadius="md" w="full">
      <Text fontWeight="medium">{shopDetails.name}</Text>
      <Text fontSize="sm" color="text.secondary">
        {shopDetails.whatsapp}
      </Text>
    </Box>
    <Text fontSize="sm" color="text.muted">
      (Location picker — Day 08)
    </Text>
  </VStack>
);

export const OnboardingFlow = () => {
  const navigate = useNavigate();
  const { data: shop, isLoading } = useMyShop();
  const state = useOnboardingState();

  if (isLoading) {
    return (
      <Center h="full">
        <Spinner />
      </Center>
    );
  }

  if (shop) {
    navigate(`${RoutePath.DeadStock}/owner/inventory`, { replace: true });
    return null;
  }

  const stepIndex = { phone: 0, "shop-details": 1, location: 2 }[state.step];

  const handleLogout = () => {
    clearToken();
    queryClient.clear();
    navigate(RoutePath.Login);
  };

  return (
    <Box className="onboarding-flow" w="full" minH="100vh" px={4} py={8}>
      <Flex justify="space-between" align="center" mb={8} maxW="sm" mx="auto">
        <Heading size="md" fontWeight="bold">
          Dead Stock
        </Heading>
        <Button variant="ghost" size="sm" onClick={handleLogout}>
          Logout
        </Button>
      </Flex>

      <VStack gap={8} w="full">
        <StepBar current={stepIndex} />

        {state.step === "phone" && (
          <PhoneStep onVerified={state.advanceToShopDetails} />
        )}

        {state.step === "shop-details" && (
          <ShopDetailsStep
            defaultPhone={state.phone}
            onNext={state.advanceToLocation}
          />
        )}

        {state.step === "location" && (
          <LocationPlaceholder shopDetails={state.shopDetails} />
        )}
      </VStack>
    </Box>
  );
};

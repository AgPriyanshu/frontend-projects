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
import { useOnboardingState } from "../../hooks/use-onboarding-state";
import { LocationStep } from "./steps/location-step";
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
    navigate("/dead-stock/login", { replace: true });
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
          <LocationStep shopDetails={state.shopDetails} />
        )}
      </VStack>
    </Box>
  );
};

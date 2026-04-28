import { Box, Flex, Heading, Text } from "@chakra-ui/react";
import { Outlet } from "react-router";
import { useMyShop } from "api/dead-stock";
import { DeadStockErrorBoundary } from "./components/_error-boundary";
import { ConsentBanner } from "./components/legal/consent-banner";
import { DeadStockFooter } from "./components/legal/footer";

const DeadStockContent = () => {
  const { data: shop } = useMyShop();

  return (
    <Flex direction="column" className="dead-stock-page" w="full" h="full">
      <Box flex="1" overflow="auto" p={8}>
        <Heading size="lg" mb={2}>
          Dead Stock Finder
        </Heading>
        <Text color="text.secondary" mb={6}>
          {shop
            ? `Managing: ${shop.name}`
            : "Discover nearby slow-moving inventory."}
        </Text>
        <Outlet />
      </Box>
      <DeadStockFooter />
      <ConsentBanner />
    </Flex>
  );
};

export const DeadStockPage = () => (
  <DeadStockErrorBoundary>
    <DeadStockContent />
  </DeadStockErrorBoundary>
);

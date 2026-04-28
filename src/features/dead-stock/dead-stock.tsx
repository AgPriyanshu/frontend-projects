import { Box, Heading, Text } from "@chakra-ui/react";
import { Outlet } from "react-router";
import { useMyShop } from "api/dead-stock";
import { DeadStockErrorBoundary } from "./components/_error-boundary";

const DeadStockContent = () => {
  const { data: shop } = useMyShop();

  return (
    <Box className="dead-stock-page" w="full" h="full" p={8}>
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
  );
};

export const DeadStockPage = () => (
  <DeadStockErrorBoundary>
    <DeadStockContent />
  </DeadStockErrorBoundary>
);

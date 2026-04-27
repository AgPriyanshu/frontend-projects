import { Box, Heading, Text } from "@chakra-ui/react";
import { Outlet } from "react-router";
import { useMyShop } from "api/dead-stock";

export const DeadStockPage = () => {
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

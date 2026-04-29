import { Box, Flex } from "@chakra-ui/react";
import { Outlet } from "react-router";
import { DeadStockErrorBoundary } from "./components/_error-boundary";
import { ConsentBanner } from "./components/legal/consent-banner";
import { DeadStockFooter } from "./components/legal/footer";

const DeadStockContent = () => (
  <Flex direction="column" className="dead-stock-page" w="100vw" h="100dvh">
    <Box flex="1" overflow="auto" minH={0}>
      <Outlet />
    </Box>
    <DeadStockFooter />
    <ConsentBanner />
  </Flex>
);

export const DeadStockPage = () => (
  <DeadStockErrorBoundary>
    <DeadStockContent />
  </DeadStockErrorBoundary>
);

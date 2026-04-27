import { Box, Text } from "@chakra-ui/react";
import { Route, Routes } from "react-router";
import { OnboardingFlow } from "./components/owner/onboarding-flow";
import { DeadStockPage } from "./dead-stock";
import { InventoryList } from "./components/owner/inventory-list";
import { SearchPage } from "./components/search/search-page";
import { ShopProfile } from "./components/shop/shop-profile";

const LeadsPage = () => (
  <Box className="ds-leads-placeholder">
    <Text>Lead inbox — coming Day 14.</Text>
  </Box>
);

export const DeadStockOwnerRoutes = () => (
  <Routes>
    <Route element={<DeadStockPage />}>
      <Route index element={<SearchPage />} />
      <Route path="shops/:id" element={<ShopProfile />} />
      <Route path="owner/onboarding" element={<OnboardingFlow />} />
      <Route path="owner/inventory" element={<InventoryList />} />
      <Route path="owner/leads" element={<LeadsPage />} />
    </Route>
  </Routes>
);

import { Box, Text } from "@chakra-ui/react";
import { Route, Routes } from "react-router";
import { OnboardingFlow } from "./components/owner/onboarding-flow";
import { DeadStockPage } from "./dead-stock";
import { InventoryList } from "./components/owner/inventory-list";

const SearchPage = () => (
  <Box className="ds-search-placeholder">
    <Text>Search — coming Day 11.</Text>
  </Box>
);

const ShopProfilePage = () => (
  <Box className="ds-shop-profile-placeholder">
    <Text>Shop profile — coming Day 13.</Text>
  </Box>
);

const LeadsPage = () => (
  <Box className="ds-leads-placeholder">
    <Text>Lead inbox — coming Day 14.</Text>
  </Box>
);

export const DeadStockOwnerRoutes = () => (
  <Routes>
    <Route element={<DeadStockPage />}>
      <Route index element={<SearchPage />} />
      <Route path="shops/:id" element={<ShopProfilePage />} />
      <Route path="owner/onboarding" element={<OnboardingFlow />} />
      <Route path="owner/inventory" element={<InventoryList />} />
      <Route path="owner/leads" element={<LeadsPage />} />
    </Route>
  </Routes>
);

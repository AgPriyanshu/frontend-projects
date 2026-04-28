import { Route, Routes } from "react-router";
import { LeadInbox } from "./components/owner/lead-inbox";
import { OnboardingFlow } from "./components/owner/onboarding-flow";
import { InventoryList } from "./components/owner/inventory-list";
import { PrivacyPage } from "./components/legal/privacy";
import { TermsPage } from "./components/legal/terms";
import { SearchPage } from "./components/search/search-page";
import { ShopProfile } from "./components/shop/shop-profile";
import { DeadStockPage } from "./dead-stock";

export const DeadStockOwnerRoutes = () => (
  <Routes>
    <Route element={<DeadStockPage />}>
      <Route index element={<SearchPage />} />
      <Route path="shops/:id" element={<ShopProfile />} />
      <Route path="owner/onboarding" element={<OnboardingFlow />} />
      <Route path="owner/inventory" element={<InventoryList />} />
      <Route path="owner/leads" element={<LeadInbox />} />
      <Route path="terms" element={<TermsPage />} />
      <Route path="privacy" element={<PrivacyPage />} />
    </Route>
  </Routes>
);

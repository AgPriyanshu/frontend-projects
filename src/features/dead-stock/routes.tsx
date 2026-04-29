import { Navigate, Route, Routes } from "react-router";
import { getAccessToken } from "shared/local-storage/token";
import { DeadStockLoginPage } from "./components/auth/dead-stock-login-page";
import { LeadInbox } from "./components/owner/lead-inbox";
import { OnboardingFlow } from "./components/owner/onboarding-flow";
import { InventoryList } from "./components/owner/inventory-list";
import { OwnerLayout } from "./components/owner/owner-layout";
import { PrivacyPage } from "./components/legal/privacy";
import { TermsPage } from "./components/legal/terms";
import { SearchPage } from "./components/search/search-page";
import { ShopProfile } from "./components/shop/shop-profile";
import { DeadStockPage } from "./dead-stock";

const OwnerRoute = ({ children }: { children: React.ReactNode }) => {
  if (!getAccessToken()) {
    return <Navigate to="/dead-stock/login" replace />;
  }
  return <>{children}</>;
};

export const DeadStockOwnerRoutes = () => (
  <Routes>
    <Route element={<DeadStockPage />}>
      {/* Public routes — no auth required */}
      <Route index element={<SearchPage />} />
      <Route path="login" element={<DeadStockLoginPage />} />
      <Route path="shops/:id" element={<ShopProfile />} />
      <Route path="terms" element={<TermsPage />} />
      <Route path="privacy" element={<PrivacyPage />} />

      {/* Owner routes — require authentication, rendered inside OwnerLayout */}
      <Route
        path="owner/onboarding"
        element={
          <OwnerRoute>
            <OnboardingFlow />
          </OwnerRoute>
        }
      />
      <Route
        element={
          <OwnerRoute>
            <OwnerLayout />
          </OwnerRoute>
        }
      >
        <Route path="owner/inventory" element={<InventoryList />} />
        <Route path="owner/leads" element={<LeadInbox />} />
      </Route>
    </Route>
  </Routes>
);

import { useState } from "react";

export type OnboardingStep = "phone" | "shop-details" | "location";

export interface ShopDetails {
  name: string;
  whatsapp: string;
  categorySlug: string;
}

interface OnboardingState {
  step: OnboardingStep;
  phone: string;
  shopDetails: ShopDetails;
}

const INITIAL: OnboardingState = {
  step: "phone",
  phone: "",
  shopDetails: { name: "", whatsapp: "", categorySlug: "" },
};

export const useOnboardingState = () => {
  const [state, setState] = useState<OnboardingState>(INITIAL);

  const setPhone = (phone: string) => setState((s) => ({ ...s, phone }));

  const advanceToShopDetails = (phone: string) =>
    setState((s) => ({ ...s, phone, step: "shop-details" }));

  const advanceToLocation = (shopDetails: ShopDetails) =>
    setState((s) => ({ ...s, shopDetails, step: "location" }));

  return { ...state, setPhone, advanceToShopDetails, advanceToLocation };
};

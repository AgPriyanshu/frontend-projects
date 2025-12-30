import { DesignSystemProvider } from "app/providers";
import { AppRouter } from "app/router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <DesignSystemProvider>
        <AppRouter />
      </DesignSystemProvider>
    </BrowserRouter>
  </StrictMode>
);

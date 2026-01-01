import { AppRouter } from "app/router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { ThemeProvider } from "shared/design-system";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
      <BrowserRouter>
    <ThemeProvider>
        <AppRouter />
    </ThemeProvider>
      </BrowserRouter>
  </StrictMode>
);

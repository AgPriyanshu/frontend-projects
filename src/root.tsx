import { AppRouter } from "app/router";
import { Toaster } from "design-system/toaster";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { QueryProvider } from "src/api";
import { ThemeProvider } from "src/design-system";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <QueryProvider>
        <ThemeProvider>
          <Toaster />
          <AppRouter />
        </ThemeProvider>
      </QueryProvider>
    </BrowserRouter>
  </StrictMode>
);

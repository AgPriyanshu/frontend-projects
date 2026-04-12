import { AppRouter } from "app/router";
import { Toaster } from "design-system/toaster";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { QueryProvider } from "src/api";
import { ThemeProvider } from "src/design-system";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <QueryProvider>
      <ThemeProvider>
        <Toaster />
        <AppRouter />
      </ThemeProvider>
    </QueryProvider>
  </BrowserRouter>
);

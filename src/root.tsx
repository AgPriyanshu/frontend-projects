import * as Sentry from "@sentry/react";
import { AppRouter } from "app/router";
import { Toaster } from "design-system/toaster";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { QueryProvider } from "src/api";
import { ThemeProvider } from "src/design-system";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 1.0,
  enabled: !!import.meta.env.VITE_SENTRY_DSN,
});

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

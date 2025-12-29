import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./app.tsx";
import { DesignSystemProvider } from "app/providers";
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <DesignSystemProvider>
      <App />
    </DesignSystemProvider>
  </StrictMode>
);

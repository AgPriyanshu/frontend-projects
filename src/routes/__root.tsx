import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { App } from "@/app";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/api/query-client";

export const Route = createRootRoute({
  component: () => (
    <QueryClientProvider client={queryClient}>
      <App>
        <Outlet />
        <TanStackRouterDevtools />
      </App>
    </QueryClientProvider>
  ),
});

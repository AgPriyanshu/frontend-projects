import { Login } from "@/features/auth/login";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/login")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="login-page flex items-center justify-center min-h-screen">
      <Login />
    </div>
  );
}

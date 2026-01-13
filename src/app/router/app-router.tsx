import { Route, Routes } from "react-router";
import { App } from "src/app";
import {
  AppItemPlaceholder,
  HomePage,
  LoginPage,
  TodoPage,
} from "src/features";
import { ProtectedRoute } from "./protected-route";
import { RoutePath } from "./constants";

export const AppRouter = () => {
  return (
    <Routes>
      {/* Protected routes - all children require authentication */}
      <Route
        element={
          <ProtectedRoute>
            <App />
          </ProtectedRoute>
        }
      >
        <Route index element={<HomePage />} />
        <Route path={RoutePath.Todo} element={<TodoPage />} />
        <Route path={RoutePath.Map} element={<AppItemPlaceholder />} />
        <Route
          path={RoutePath.DeviceClassifier}
          element={<AppItemPlaceholder />}
        />
        <Route path={RoutePath.Store} element={<AppItemPlaceholder />} />
      </Route>

      {/* Public routes - no authentication required */}
      <Route path={RoutePath.Login} element={<LoginPage />} />
    </Routes>
  );
};

import { Route, Routes } from "react-router";
import { App } from "src/app";
import { LoginPage } from "src/features";

export const AppRouter = () => {
  return (
    <Routes>
      <Route element={<App />}>
        {/* <Route index element={<Home />} /> */}
        <Route path="/login" element={<LoginPage />} />
      </Route>
    </Routes>
  );
};

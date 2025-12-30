import { Route, Routes } from "react-router";
import { App } from "src/app";

export const AppRouter = () => {
  return (
    <Routes>
      <Route path="" element={<App />} />
    </Routes>
  );
};

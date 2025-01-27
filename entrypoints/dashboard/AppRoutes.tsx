import { Route, Routes } from "react-router";
import { AppLayout } from "./routes/AppLayout";
import { Settings } from "./routes/settings/Settings";
import { Home } from "./routes/home/Home";

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Home />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

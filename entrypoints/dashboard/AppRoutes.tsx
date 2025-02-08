import { Route, Routes } from "react-router";
import { AppLayout } from "./routes/AppLayout";
import { Blocklist } from "./routes/blocklist/Blocklist";
import { Home } from "./routes/home/Home";
import { Settings } from "./routes/settings/Settings";
import { useAuth } from "@/common/components/auth/AuthContext";

export function AppRoutes() {
  const auth = useAuth();
  if (!auth.ready) {
    return null;
  }

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Home />} />
        {!!auth.user && (
          <>
            <Route path="settings" element={<Settings />} />
            <Route path="blocklist" element={<Blocklist />} />
          </>
        )}
      </Route>
    </Routes>
  );
}

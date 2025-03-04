import { useAuth } from "@/common/components/auth/AuthContext";
import { Route, Routes } from "react-router";
import { Dashboard } from "./routes/analytics/analytics";
import { AppLayout } from "./routes/AppLayout";
import { Blocklist } from "./routes/blocklist/Blocklist";
import { Addsession } from "./routes/focustimer/Addsession";
import { Focustimer } from "./routes/focustimer/Focustimer";
import { Home } from "./routes/home/Home";
import { BlockedPage } from "./routes/blocklist/BlockedPage";

export function AppRoutes() {
  const auth = useAuth();
  if (!auth.ready) {
    return null;
  }

  return (
    <Routes>
      <Route
        path="blocked"
        element={<BlockedPage />}
      />
      <Route element={<AppLayout />}>
        <Route index element={<Home />} />
        {!!auth.user && (
          <>
            <Route path="blocklist" element={<Blocklist />} />
            <Route path="focustimer">
              <Route index element={<Focustimer />} />
              <Route path="addsession" element={<Addsession />} />
            </Route>
            <Route path="analytics" element={<Dashboard />} />
          </>
        )}
      </Route>
    </Routes>
  );
}

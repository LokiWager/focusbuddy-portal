import { Route, Routes } from "react-router";
import { AppLayout } from "./routes/AppLayout";
import { Blocklist } from "./routes/blocklist/Blocklist";
import { Home } from "./routes/home/Home";
import { Settings } from "./routes/settings/Settings";
import { useAuth } from "@/common/components/auth/AuthContext";
import { Focustimer } from "./routes/focustimer/Focustimer";
import { Addsession } from "./routes/focustimer/Addsession";


export function AppRoutes() {
  const auth = useAuth();
  if (!auth.ready) {
    return null;
  }

return (
  <Routes>
    <Route path="blocked" element={<div>BLOCKED</div>} />
    <Route element={<AppLayout />}>
      <Route index element={<Home />} />
      {!!auth.user && (
        <>
          <Route path="settings" element={<Settings />} />
          <Route path="blocklist" element={<Blocklist />} />
          <Route path="focustimer">
            <Route index element={<Focustimer />} /> 
            <Route path="addsession" element={<Addsession />} />
          </Route>
        </>
      )}
    </Route>
  </Routes>
);
}
import { Route, Routes } from "react-router";
import { AppLayout } from "./routes/AppLayout";
import { Settings } from "./routes/settings/Settings";
import { Blocklist } from "./routes/blocklist/Blocklist";
import { Home } from "./routes/home/Home";
import { Focustimer } from "./routes/focustimer/Focustimer";
import { Addsession } from "./routes/focustimer/Addsession";
import { Deletesession } from "./routes/focustimer/Deletesession";  

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Home />} />
        <Route path="settings" element={<Settings />} />
        <Route path="blocklist" element={<Blocklist />} />
        <Route path="focustimer">
          <Route index element={<Focustimer />} /> 
          <Route path="addsession" element={<Addsession />} />
          <Route path="deletesession" element={<Deletesession />} />
        </Route>
      </Route>
    </Routes>
  );
}

import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router";
import { AppRoutes } from "./AppRoutes.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HashRouter>
      <AppRoutes />
    </HashRouter>
  </React.StrictMode>
);

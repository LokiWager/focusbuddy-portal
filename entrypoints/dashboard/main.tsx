import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router";
import { AppRoutes } from "./AppRoutes.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </QueryClientProvider>
  </React.StrictMode>
);

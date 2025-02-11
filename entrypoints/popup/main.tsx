import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import {
  AuthContext,
  AuthProvider,
} from "@/common/components/auth/AuthContext.tsx";
import { Login } from "@/common/components/auth/login.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Layout } from "./Layout.tsx";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <AuthContext.Consumer>
          {(value) => {
            return <Layout>{value?.user ? <App /> : null}</Layout>;
          }}
        </AuthContext.Consumer>
      </QueryClientProvider>
    </AuthProvider>
  </React.StrictMode>
);

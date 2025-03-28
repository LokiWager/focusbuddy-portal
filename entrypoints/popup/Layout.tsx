import { useAuth } from "@/common/components/auth/AuthContext";
import { Login } from "@/common/components/auth/login";
import { ReactNode } from "react";
import { browser } from "wxt/browser";

const DASHBOARD_URL = browser.runtime.getURL("/dashboard.html");
// const SETTINGS_URL = browser.runtime.getURL("/dashboard.html#/settings");

export function Layout(props: { children: ReactNode }) {
  const auth = useAuth();

  return (
    <div className="app-container">
      {/* Links */}
      <div className="app-links">
        <a
          href={DASHBOARD_URL}
          target="_blank"
          rel="noreferrer"
          className="focus-buddy-link"
        >
          <img src="/icon/logo.png" alt="Focus Buddy" />
          Focus Buddy
        </a>
        {auth.user ? null : <Login />}
      </div>
      {props.children}
    </div>
  );
}

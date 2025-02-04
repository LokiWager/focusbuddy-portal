import { useState } from "react";
import { browser } from "wxt/browser";
import FocusTimer from "./routes/focusTimer/focusTimer";
import BlockList from "./routes/blocklist/blocklist";
import "./style.css"; // Import the CSS file

const DASHBOARD_URL = browser.runtime.getURL("/dashboard.html");
const SETTINGS_URL = browser.runtime.getURL("/dashboard.html#/settings");

function App() {
  const [activeTab, setActiveTab] = useState<"tab1" | "tab2">("tab1");

  return (
    <div className="app-container">
      {/* Links */}
      <p className="app-links">
        <a href={DASHBOARD_URL} target="_blank" rel="noreferrer" className="focus-buddy-link">
          <img src="/icon/logo.png" alt="Focus Buddy" />
          Focus Buddy
        </a>
        <a href={SETTINGS_URL} target="_blank" rel="noreferrer">
          <img src="/icon/settings-icon.png" alt="Focus Buddy" className="settings-icon" />
        </a>
      </p>

      {/* Tab buttons */}
      <div className="tabs-container">
        <button
          onClick={() => setActiveTab("tab1")}
          className={`tab-button ${activeTab === "tab1" ? "active-tab" : ""}`}
        >
          <img src="/icon/focus-tab-icon.png" alt="Focus Tab" />
          Focus Timer
        </button>
        <button
          onClick={() => setActiveTab("tab2")}
          className={`tab-button ${activeTab === "tab2" ? "active-tab" : ""}`}
        >
          <img src="/icon/block-tab-icon.png" alt="Block Tab" />
          Block Sites
        </button>
      </div>

      {/* Component display */}
      <div className="content-container">
        {activeTab === "tab1" ? <FocusTimer /> : <BlockList />}
      </div>
    </div>
  );
}

export default App;

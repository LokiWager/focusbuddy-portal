import { useState } from "react";
import { Blocklist } from "./routes/blocklist/BlockList";
import FocusTimer from "./routes/focusTimer/FocusTimer";
import "./style.css"; // Import the CSS file

function App() {
  const [activeTab, setActiveTab] = useState<"tab1" | "tab2">("tab1");

  return (
    <div>
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
        {activeTab === "tab1" ? <FocusTimer /> : <Blocklist />}
      </div>
    </div>
  );
}

export default App;

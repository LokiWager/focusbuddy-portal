import { browser } from "wxt/browser";

const DASHBOARD_URL = browser.runtime.getURL("/dashboard.html");

function App() {
  return (
    <div>
      <p>
        <a href={DASHBOARD_URL} target="_blank" rel="noreferrer">
          Open dashboard
        </a>
      </p>
    </div>
  );
}

export default App;

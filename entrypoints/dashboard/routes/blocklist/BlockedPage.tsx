import { useEffect } from "react";
import "../../BlockedPage.css";

export function BlockedPage() {
  useEffect(() => {
    document.body.classList.add("blocked-background");

    return () => {
      document.body.classList.remove("blocked-background");
    };
  }, []);
  return (
    <div className="blocked-container" data-testid="blocked-page">
      <div id="clouds">
        <div className="cloud x1"></div>
        <div className="cloud x1_5"></div>
        <div className="cloud x2"></div>
        <div className="cloud x3"></div>
        <div className="cloud x4"></div>
        <div className="cloud x5"></div>
      </div>
      <div className="c">
        <div className="_404">404</div>
        <hr />
        <div className="_1">We blocked this site</div>
        <div className="_2">so that you can focus better.</div>
        <div className="_3">Focus, buddy!</div>
      </div>
    </div>
  );
}

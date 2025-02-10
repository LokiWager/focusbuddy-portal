import { useState, useEffect } from "react";
import { browser } from "wxt/browser";
import { BlockListType, useListBlocklist } from "@/common/api/api"; // Ensure the correct path
import { getIconURLFromDomain, parseDomainFromURL } from "@/common/core/blocklist";
import { Button } from "@/common/components/ui/button";
const BLOCKLIST_URL = browser.runtime.getURL("/dashboard.html#/blocklist");

const Blocklist = () => {
  const [currentSite, setCurrentSite] = useState<string>("");
  const [favicon, setFavicon] = useState<string>("");
  const [currentState, setCurrentState] = useState<string>("idle");
  const [focusType, setFocusType] = useState<string>("None");
  const [isBlocked, setIsBlocked] = useState<boolean>(false);
  //const { blocklists } = useListBlocklist();

  useEffect(() => {
    // Fetch the active tab
    browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
      if (tabs.length > 0 && tabs[0].url) {
        const domain = new URL(tabs[0].url).origin; // Get base domain
        setCurrentSite(parseDomainFromURL(tabs[0].url));
        setFavicon(getIconURLFromDomain(domain))
      }
    });
    browser.storage.local.get(["focusState", "focusType"]).then((data) => {
      if (data.focusState) {
        setCurrentState((data.focusState as string) ?? "idle");
      }
      if (data.focusType) {
        setFocusType((data.focusType as string) ?? "None");
      }
    });
  }, []);
  /*useEffect(() => {
    if (currentState === "focus" && blocklists) {
      const validFocusType = (Object.keys(BlockListType) as Array<keyof typeof BlockListType>).includes(focusType as keyof typeof BlockListType)
        ? (focusType as keyof typeof BlockListType)
        : "Work"; // Default to "Work" if invalid
  
      const siteBlocked = blocklists.some(
        (entry) =>
          entry.domain === currentSite &&
          (entry.list_type === BlockListType[validFocusType] || entry.list_type === BlockListType.Permanent) // Check focusType or Permanent
      );
  
      setIsBlocked(siteBlocked);
    } else {
      setIsBlocked(false);
    }
  }, [currentSite, focusType, currentState, blocklists]);*/
  const toBlocklist = () => {
    window.open(BLOCKLIST_URL, "_blank");
  };
  return (
    <div className="grid place-items-center h-16">
      {currentSite && (
        <img
          src={favicon}
          alt="favicon"
          className="w-10 h-10"
          onError={(e) => (e.currentTarget.src = "/default-favicon.png")}
        />
      )}
      <div className="grid place-items-center text-lg mt-2">
        <p className='font-bold'>{currentSite}</p>
        <p>Current Focus State: <strong>{currentState}</strong></p>
        <p>Focus Type: <strong>{focusType}</strong></p>
        <p>Blocked: <strong>{isBlocked ? "Yes" : "No"}</strong></p>
      </div>
      <div className="button-container">
            <Button className="button1">
              Block This Site
            </Button>
            <Button className="button2" onClick={toBlocklist}>
              Edit Block List
            </Button>
      </div>
    </div>
  );
};

export default Blocklist;
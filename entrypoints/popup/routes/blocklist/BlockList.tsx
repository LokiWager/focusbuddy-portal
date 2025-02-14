import { useState, useEffect } from "react";
import { browser } from "wxt/browser";
import { BlockListType, useAddBlocklist, useDeleteBlocklist } from "@/common/api/api"; 
import { getBlocklistFromLocalStorage, getIconURLFromDomain, parseDomainFromURL } from "@/common/core/blocklist";
import { Button } from "@/common/components/ui/button";
import { toast } from "@/common/hooks/use-toast";

const BLOCKLIST_URL = browser.runtime.getURL("/dashboard.html#/blocklist");

const Blocklist = () => {
  const [currentSite, setCurrentSite] = useState<string>("");
  const [favicon, setFavicon] = useState<string>("");
  const [currentState, setCurrentState] = useState<string>("idle");
  const [focusType, setFocusType] = useState<string>("None");
  const [isBlocked, setIsBlocked] = useState<boolean>(false);
  const [blocklistId, setBlocklistId] = useState<string | null>(null);

  const addMutation = useAddBlocklist();
  const deleteMutation = useDeleteBlocklist();

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
      setCurrentState((data.focusState as string) ?? "idle");
      setFocusType((data.focusType as string) ?? "None");
    });
  }, []);

  useEffect(() => {
    const convertBlocklistType = () => {
      switch (focusType) {
        case "Work":
          return BlockListType.Work;
        case "Study":
          return BlockListType.Study;
        case "Personal":
          return BlockListType.Personal;
        case "Other":
          return BlockListType.Other;
        default:
          return BlockListType.Other;
      }
    };

    getBlocklistFromLocalStorage().then((blocklist) => {
      if (blocklist !== null) {
        const isSiteInFocusList = 
          currentState === "focus" &&
          blocklist.some(
            (entry) =>
              entry.domain === currentSite &&
              entry.list_type === convertBlocklistType()
          );

        const matchingEntry = blocklist.find(
            (entry) =>
              entry.domain === currentSite &&
              entry.list_type === BlockListType.Permanent
          );
        if (isSiteInFocusList || matchingEntry) {
          setIsBlocked(true);
          setBlocklistId(matchingEntry?.id || null);
        } else {
          setIsBlocked(false);
          setBlocklistId(null);
        }
      } else {
        setIsBlocked(false);
      }
    });
  }, [currentSite, currentState, focusType, isBlocked]); 

  const toBlocklist = () => {
    window.open(BLOCKLIST_URL, "_blank");
  };

  const toggleBlockStatus = async () => {
    if (!currentSite) return;

    if (isBlocked && blocklistId) {
      // Remove from permanent blocklist
      deleteMutation.mutate(
        { blocklistId },
        {
          onSuccess: () => {
            toast({
              title: "Removed!",
              description: `${currentSite} has been unblocked.`,
            });
            setIsBlocked(false);
            setBlocklistId(null);
          },
          onError: (err) => {
            toast({
              variant: "destructive",
              title: "Error removing site",
              description: err.message,
            });
          },
        }
      );
    } else {
      // Add to permanent blocklist
      addMutation.mutate(
        { domain: currentSite, list_type: BlockListType.Permanent },
        {
          onSuccess: () => {
            toast({
              title: "Added!",
              description: `${currentSite} is now blocked.`,
            });
            setIsBlocked(true);
          },
          onError: (err) => {
            toast({
              variant: "destructive",
              title: "Error adding site",
              description: err.message,
            });
          },
        }
      );
    }
  };

  return (
    <div className="flex flex-col justify-between min-h-[275px]">
      <div className="grid place-items-center">
        {currentSite && (
          <div className="flex flex-col items-center">
            <img
              src={favicon}
              alt="favicon"
              className="w-10 h-10 mt-4"
              onError={(e) => (e.currentTarget.src = "/default-favicon.png")}
            />
            <div className="grid place-items-center text-lg">
              <p className="font-bold">{currentSite}</p>
              <p>{isBlocked ? "Blocked" : "Not Blocked"}</p>
            </div>
          </div>

        )}
      </div>

      <div className="button-container flex justify-center">
          {currentSite && currentState !== "focus" && (
            <Button className="button1" onClick={toggleBlockStatus}>
              {isBlocked ? "Unblock This Site" : "Block This Site"}
            </Button>
          )}
            <Button className="button2" onClick={toBlocklist}>
              Change Blocked Sites
            </Button>
      </div>
    </div>
  );
};

export default Blocklist;
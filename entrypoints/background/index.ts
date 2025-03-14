import { BlockListType } from "@/common/api/api";
import { browser } from "wxt/browser";
import { defineBackground } from "wxt/sandbox";
import { storage } from "wxt/storage";
import { blockDebugger, blockPermanentSites, blockSites } from "./blocker";
import {
  FOCUS_STORAGE_KEY,
  initializeState,
  timerListener,
} from "./focusTimerBackground";

async function onStorageChange() {
  const xfocus: { state: string; type: string } | null =
    await storage.getItem(FOCUS_STORAGE_KEY);

  const { state, type } = xfocus || { state: "idle", type: "" };
  if (state === "focus") {
    await blockSites(BlockListType[type as keyof typeof BlockListType]);
  } else {
    await blockPermanentSites();
  }
}

export default defineBackground(async () => {
  console.log("Hello background!", { id: browser.runtime.id });

  // Handle connections from the popup
  chrome.runtime.onConnect.addListener(timerListener);

  chrome.storage.onChanged.addListener(async (changes, namespace) => {
    if (changes.x_focus || changes.blocklist) {
      await onStorageChange();
    }
  });

  await initializeState();
  await onStorageChange();

  // @ts-expect-error - Setting a global variable
  self.d = blockDebugger();
});

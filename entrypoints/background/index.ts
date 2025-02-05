import { browser } from "wxt/browser";
import { defineBackground } from "wxt/sandbox";
import { timerListener } from "./focusTimerBackground";

export default defineBackground(() => {
  console.log("Hello background!", { id: browser.runtime.id });

  // Handle connections from the popup
  chrome.runtime.onConnect.addListener(timerListener);
});

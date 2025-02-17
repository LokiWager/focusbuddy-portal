import { browser } from "wxt/browser";
import { defineBackground } from "wxt/sandbox";
import { timerListener } from "./focusTimerBackground";
import { blockDebugger } from "./blocker";

export default defineBackground(() => {
  console.log("Hello background!", { id: browser.runtime.id });

  // Handle connections from the popup
  chrome.runtime.onConnect.addListener(timerListener);

  // @ts-expect-error - Setting a global variable
  self.d = blockDebugger();
});

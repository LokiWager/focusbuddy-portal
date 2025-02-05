import { browser } from "wxt/browser";
import { defineBackground } from "wxt/sandbox";
import "./background/focusTimerBackground";

export default defineBackground(() => {
  console.log("Hello background!", { id: browser.runtime.id });
});

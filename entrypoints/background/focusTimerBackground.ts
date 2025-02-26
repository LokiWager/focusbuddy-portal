import {
  BlockListType,
  FocusSessionStatus,
  UserStatus,
  updateFocusSession,
  updateUserStatus,
} from "@/common/api/api";
import { blockSites, unblockAllSites } from "./blocker";
let focusTimer: NodeJS.Timeout | null = null;
let currentState: "idle" | "focus" | "rest" = "idle";
let focusLength = 30;
let breakLength = 10;
let focusType = "Choose a focus type";
let remainingFocusTime = 30 * 60;
let remainingBreakTime = 10 * 60;
let sessionId = "";
const ports: chrome.runtime.Port[] = [];

interface Message {
  type: string;
  currentState?: string;
  focusLength?: number;
  breakLength?: number;
  focusType?: string;
  remainingFocusTime?: number;
  remainingBreakTime?: number;
  sessionId?: string;
}

function updateCurrentState(state: typeof currentState) {
  if (currentState !== "focus" && state === "focus") {
    const type = BlockListType[focusType as keyof typeof BlockListType];
    blockSites(type);
  } else if (currentState === "focus" && state !== "focus") {
    unblockAllSites();
  }
  currentState = state;
}

export function timerListener(port: chrome.runtime.Port) {
  console.log("Popup connected:", port.name);
  ports.push(port);

  // Send initial state to the newly connected popup
  port.postMessage(getCurrentState());

  // Listen for messages from the popup
  port.onMessage.addListener((message) => {
    if (!isMessage(message)) return;

    switch (message.type) {
      case "START_FOCUS":
        startFocusSession(message);
        break;
      case "START_BREAK":
        startBreakSession();
        break;
      case "END_BREAK":
        endBreakSession();
        break;
      case "STOP_SESSION":
        stopSession();
        break;
      case "GET_STATE":
        port.postMessage(getCurrentState());
        break;
    }
  });

  // Handle popup disconnecting
  port.onDisconnect.addListener(() => {
    console.log("Popup disconnected");
    const index = ports.indexOf(port);
    if (index !== -1) {
      ports.splice(index, 1);
    }
  });
}

function isMessage(message: unknown): message is Message {
  return typeof message === "object" && message !== null && "type" in message;
}

function startFocusSession(message: Message) {
  focusLength = message.focusLength ?? 30;
  breakLength = message.breakLength ?? 10;
  focusType = message.focusType ?? "Choose a focus type";
  remainingFocusTime = focusLength * 60;
  remainingBreakTime = breakLength * 60;
  sessionId = message.sessionId ?? "";
  updateCurrentState("focus");
  startTimer();
  broadcastMessage(getCurrentState());
  console.log("StartFocusSession", message);
}

function startBreakSession() {
  updateCurrentState("rest");
  startTimer();
  broadcastMessage(getCurrentState());
  console.log("StartBreakSession");
}

function endBreakSession() {
  updateCurrentState("focus");
  startTimer();
  broadcastMessage(getCurrentState());
  console.log("EndBreakSession");
}

function startTimer() {
  if (focusTimer) clearInterval(focusTimer);

  focusTimer = setInterval(() => {
    if (currentState === "focus" && remainingFocusTime > 0) {
      remainingFocusTime--;
    } else if (currentState === "rest" && remainingBreakTime > 0) {
      remainingBreakTime--;
    } else if (currentState === "rest" && remainingBreakTime <= 0) {
      const request = {
        session_status: FocusSessionStatus.Ongoing,
        remaining_break_time: remainingBreakTime,
      };
      updateFocusSession(sessionId, request)
        .then((data) => {
          console.log("Session updated successfully:", data);
          updateCurrentState("focus");
          remainingFocusTime--;
        })
        .catch((err) => {
          console.error("Error updating session:", err);
        });
      updateUserStatus({
        user_status: UserStatus[focusType as keyof typeof UserStatus],
      })
        .then((data) => {
          console.log("User status updated successfully:", data);
        })
        .catch((err) => {
          console.error("Error updating user status:", err);
        });
    } else {
      const request = {
        session_status: FocusSessionStatus.Completed,
        remaining_focus_time: remainingFocusTime,
      };
      updateFocusSession(sessionId, request)
        .then((data) => {
          console.log("Session updated successfully:", data);
          stopSession();
        })
        .catch((err) => {
          console.error("Error updating session:", err);
        });
      if (currentState !== "rest") {
        updateUserStatus({ user_status: UserStatus.Idle })
          .then((data) => {
            console.log("User status updated successfully:", data);
          })
          .catch((err) => {
            console.error("Error updating user status:", err);
          });
      }
    }
    broadcastMessage({
      type: "TIMER_UPDATE",
      remainingFocusTime,
      remainingBreakTime,
    });
  }, 1000);
}

function stopSession() {
  stopTimer();
  resetState();
  broadcastMessage({ type: "SESSION_COMPLETE" });
}

function stopTimer() {
  if (focusTimer) clearInterval(focusTimer);
  focusTimer = null;
}

function resetState() {
  focusLength = 30;
  breakLength = 10;
  focusType = "Choose a focus type";
  remainingFocusTime = 30 * 60;
  remainingBreakTime = 10 * 60;
  sessionId = "";
  updateCurrentState("idle");
}

function broadcastMessage(message: Message) {
  ports.forEach((port) => {
    try {
      port.postMessage(message);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  });
}

function getCurrentState(): Message {
  return {
    type: "STATE_UPDATE",
    currentState,
    focusLength,
    breakLength,
    focusType,
    remainingFocusTime,
    remainingBreakTime,
    sessionId,
  };
}

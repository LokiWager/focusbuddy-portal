import {
  FocusSessionStatus,
  FocusSessionType,
  UserStatus,
  getCurrFocusSession,
  updateFocusSession,
  updateUserStatus,
  GetFocusSessionResponse
} from "@/common/api/api";
import { Focus } from "lucide-react";
import { storage } from "wxt/storage";
let focusTimer: NodeJS.Timeout | null = null;
let currentState: "idle" | "focus" | "rest" = "idle";
let focusLength = 30;
let breakLength = 10;
let focusType = "Choose a focus type";
let remainingFocusTime = 30 * 60;
let remainingBreakTime = 10 * 60;
let sessionId = "";
const ports: chrome.runtime.Port[] = [];

let nextFocusLength = 30;
let nextBreakLength = 10;
let nextFocusType = "Choose a focus type";
let nextSessionId = "";
let nextStartTime = "";
let nextStartDate = "";

export const FOCUS_STORAGE_KEY = "local:x_focus";
const NEXT_SESSION_STORAGE_KEY = "local:next_focus_session";

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

async function updateCurrentStateAndType(
  state: typeof currentState,
  type: string,
) {
  focusType = type;
  currentState = state;

  // write to storage
  await storage.setItem(FOCUS_STORAGE_KEY, {
    state: state,
    type: type,
  });
}

const SessionTypeReverse = Object.fromEntries(
  Object.entries(FocusSessionType).map(([key, value]) => [value, key]),
);

export async function initializeState() {
  const data = await getCurrFocusSession();
  console.log("Current Focus Session:", data);
  if (data.focus_sessions.length > 0) {
    const session = data.focus_sessions[0];
    const currSessionId = session.session_id;
    const currBreakDuration = session.break_duration;
    const currFocusDuration = session.duration;
    const currRemainingFocusTime = session.remaining_focus_time;
    const currRemainingBreakTime = session.remaining_break_time;
    const currFocusType = SessionTypeReverse[session.session_type];
    const currStatus = session.session_status;
    const currStartDate = session.start_date;
    const currStartTime = session.start_time;
    const startDateTimeInSeconds = Math.floor(
      new Date(`${currStartDate} ${currStartTime}`).getTime() / 1000,
    );
    const completedFocusTime = currFocusDuration * 60 - currRemainingFocusTime;
    const completedBreakTime = currBreakDuration * 60 - currRemainingBreakTime;
    const now = Math.floor(new Date().getTime() / 1000);
    if (
      currStatus === FocusSessionStatus.Ongoing &&
      now < startDateTimeInSeconds + completedBreakTime + currFocusDuration * 60
    ) {
      // resume focus
      console.log(
        "Ongoing focus session found, starting timer with remaining focus time:",
        startDateTimeInSeconds +
          completedBreakTime +
          currRemainingFocusTime -
          now,
      );
      await updateCurrentStateAndType("focus", currFocusType);
      focusLength = currFocusDuration;
      breakLength = currBreakDuration;
      remainingFocusTime =
        startDateTimeInSeconds +
        completedBreakTime +
        currRemainingFocusTime -
        now;
      remainingBreakTime = currRemainingBreakTime;
      sessionId = currSessionId;
      startTimer();
    } else if (currStatus === FocusSessionStatus.Paused) {
      if (
        now <
        startDateTimeInSeconds + completedFocusTime + currBreakDuration * 60
      ) {
        // resume break
        console.log(
          "Ongoing break session found, starting timer with remaining break time:",
          startDateTimeInSeconds +
            completedFocusTime +
            currRemainingBreakTime -
            now,
        );
        focusLength = currFocusDuration;
        breakLength = currBreakDuration;
        await updateCurrentStateAndType("rest", currFocusType);
        remainingFocusTime = currRemainingFocusTime;
        remainingBreakTime =
          startDateTimeInSeconds +
          completedFocusTime +
          currRemainingBreakTime -
          now;
        sessionId = currSessionId;
        startTimer();
      } else if (
        now <
        startDateTimeInSeconds + currFocusDuration * 60 + currBreakDuration * 60
      ) {
        // break time up, resume focus
        console.log(
          "Previoud break session completed, starting timer with remaining focus time:",
          startDateTimeInSeconds +
            currBreakDuration * 60 +
            currRemainingFocusTime -
            now,
        );
        focusLength = currFocusDuration;
        breakLength = currBreakDuration;
        await updateCurrentStateAndType("focus", currFocusType);
        remainingFocusTime =
          startDateTimeInSeconds +
          currBreakDuration * 60 +
          currRemainingFocusTime -
          now;
        remainingBreakTime = 0;
        sessionId = currSessionId;
        startTimer();
        try {
          const updateUserData = await updateUserStatus({
            user_status: UserStatus[focusType as keyof typeof UserStatus],
          });
          console.log("User status updated successfully:", updateUserData);
        } catch (err) {
          console.error("Error updating user status:", err);
        }
      } else {
        // both focus and break time up, complete session
        const request = {
          session_status: FocusSessionStatus.Completed,
          remaining_focus_time: 0,
          remaining_break_time: 0,
        };
        try {
          const data = await updateFocusSession(currSessionId, request);
          console.log("Session updated successfully:", data);
          stopSession();
        } catch (err) {
          console.error("Error updating session:", err);
        }
        resetState();
      }
    } else {
      // focus time up, complete session
      const request = {
        session_status: FocusSessionStatus.Completed,
        remaining_focus_time: 0,
      };
      try {
        const data = await updateFocusSession(currSessionId, request);
        console.log("Session updated successfully:", data);
        stopSession();
      } catch (err) {
        console.error("Error updating session:", err);
      }
      try {
        const userData = await updateUserStatus({
          user_status: UserStatus.Idle,
        });
        console.log("User status updated successfully:", userData);
      } catch (err) {
        console.error("Error updating user status:", err);
      }
      resetState();
    }
  }
  storage.getItem<GetFocusSessionResponse>(NEXT_SESSION_STORAGE_KEY).then((data) => {
    nextFocusLength = data?.duration ?? 30;
    nextBreakLength = data?.break_duration ?? 10;
    nextFocusType = data?.session_type ? SessionTypeReverse[data.session_type] : "Choose a focus type";
    nextSessionId = data?.session_id ?? "";
    nextStartTime = data?.start_time ?? "";
    nextStartDate = data?.start_date ?? "";
    console.log("Next Focus Session:", data);
    checkSessionTime();

    chrome.storage.onChanged.addListener((changes, ) => {
      if (changes.next_focus_session) {
        const data = changes.next_focus_session.newValue;
        nextFocusLength = data?.duration ?? 30;
        nextBreakLength = data?.break_duration ?? 10;
        nextFocusType = data?.session_type ? SessionTypeReverse[data.session_type] : "Choose a focus type";
        nextSessionId = data?.session_id ?? "";
        nextStartTime = data?.start_time ?? "";
        nextStartDate = data?.start_date ?? "";
        console.log("Updated Next Focus Session:", data);
      }
    });
  });
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
  updateCurrentStateAndType(
    "focus",
    message.focusType ?? "Choose a focus type",
  );
  remainingFocusTime = focusLength * 60;
  remainingBreakTime = breakLength * 60;
  sessionId = message.sessionId ?? "";
  startTimer();
  broadcastMessage(getCurrentState());
  console.log("StartFocusSession", message);
}

function startBreakSession() {
  updateCurrentStateAndType("rest", focusType);
  startTimer();
  broadcastMessage(getCurrentState());
  console.log("StartBreakSession");
}

function endBreakSession() {
  updateCurrentStateAndType("focus", focusType);
  startTimer();
  broadcastMessage(getCurrentState());
  console.log("EndBreakSession");
}

function startTimer() {
  if (focusTimer) clearInterval(focusTimer);

  focusTimer = setInterval(() => {
    if (currentState === "focus" && remainingFocusTime > 0) {
      remainingFocusTime--;
      updateSessionTime();
    } else if (currentState === "rest" && remainingBreakTime > 0) {
      remainingBreakTime--;
      updateSessionTime();
    } else if (currentState === "rest" && remainingBreakTime <= 0) {
      const request = {
        session_status: FocusSessionStatus.Ongoing,
        remaining_break_time: remainingBreakTime,
      };
      updateFocusSession(sessionId, request)
        .then((data) => {
          console.log("Session updated successfully:", data);
          updateCurrentStateAndType("focus", focusType);
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

const checkSessionTime = () => {
  setInterval(() => {
    if (nextStartTime != "" && nextStartDate != "") {
      const startDateTimeInSeconds = Math.floor(
        new Date(`${nextStartDate} ${nextStartTime}`).getTime() / 1000
      );
      const now = Math.floor(new Date().getTime() / 1000);
      if (now === startDateTimeInSeconds) {
        console.log("Time to start the session!");
        // Trigger session start logic
        updateFocusSession(nextSessionId, {session_status: FocusSessionStatus.Ongoing})
          .then((data) => {
            console.log("Session updated successfully:", data);
            const message = {
              type: "START_FOCUS",
              currentState: "focus",
              focusLength: nextFocusLength,
              breakLength: nextBreakLength,
              focusType: nextFocusType,
              sessionId: nextSessionId,
            }
            startFocusSession(message);
            resetNextSession();
          })
          .catch((err) => {
            console.error("Error updating session:", err);
          });
        updateUserStatus({
          user_status: UserStatus[nextFocusType as keyof typeof UserStatus],
        })
          .then((data) => {
            console.log("User status updated successfully:", data);
          })
          .catch((err) => {
            console.error("Error updating user status:", err);
          });
      }
    }
  }, 1000);
};

function updateSessionTime() {
  const request = {
    remaining_focus_time: remainingFocusTime,
    remaining_break_time: remainingBreakTime,
  };
  updateFocusSession(sessionId, request)
    .then((data) => {
      console.log("Session updated successfully:", data);
    })
    .catch((err) => {
      console.error("Error updating session:", err);
    });
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
  updateCurrentStateAndType("idle", (focusType = "Choose a focus type"));
  remainingFocusTime = 30 * 60;
  remainingBreakTime = 10 * 60;
  sessionId = "";
}

function resetNextSession() {
  nextFocusLength = 30;
  nextBreakLength = 10;
  nextFocusType = "Choose a focus type";
  nextSessionId = "";
  nextStartTime = "";
  nextStartDate = "";
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

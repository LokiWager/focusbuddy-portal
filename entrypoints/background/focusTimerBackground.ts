let focusTimer: NodeJS.Timeout | null = null;
let currentState: "idle" | "focus" | "rest" = "idle";
let focusLength = 30;
let breakLength = 5;
let focusType = "Choose a focus type";
let remainingFocusTime = 30 * 60;
let remainingBreakTime = 5 * 60;
const ports: chrome.runtime.Port[] = [];

interface Message {
  type: string;
  currentState?: string;
  focusLength?: number;
  breakLength?: number;
  focusType?: string;
  remainingFocusTime?: number;
  remainingBreakTime?: number;
}

// Handle connections from the popup
chrome.runtime.onConnect.addListener((port) => {
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
        startBreakSession(message);
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
});

function isMessage(message: unknown): message is Message {
  return typeof message === "object" && message !== null && "type" in message;
}

function startFocusSession(message: Message) {
  currentState = "focus";
  focusLength = message.focusLength ?? 30;
  breakLength = message.breakLength ?? 5;
  focusType = message.focusType ?? "Choose a focus type";
  remainingFocusTime = focusLength * 60;
  remainingBreakTime = breakLength * 60;
  startTimer();
}

function startBreakSession(message: Message) {
  currentState = "rest";
  remainingBreakTime = (message.remainingBreakTime ?? 5) * 60;
  startTimer();
}

function startTimer() {
  if (focusTimer) clearInterval(focusTimer);

  focusTimer = setInterval(() => {
    if (currentState === "focus" && remainingFocusTime > 0) {
      remainingFocusTime--;
    } else if (currentState === "rest" && remainingBreakTime > 0) {
      remainingBreakTime--;
    } else {
      stopTimer();
      currentState = "idle";
      broadcastMessage({ type: "SESSION_COMPLETE" });
    }
    broadcastMessage({ type: "TIMER_UPDATE", remainingFocusTime, remainingBreakTime });
  }, 1000);
}

function stopSession() {
  stopTimer();
  resetState();
  broadcastMessage({ type: "SESSION_STOPPED" });
}

function stopTimer() {
  if (focusTimer) clearInterval(focusTimer);
  focusTimer = null;
}

function resetState() {
  currentState = "idle";
  focusLength = 30;
  breakLength = 5;
  focusType = "Choose a focus type";
  remainingFocusTime = 30 * 60;
  remainingBreakTime = 5 * 60;
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
  };
}

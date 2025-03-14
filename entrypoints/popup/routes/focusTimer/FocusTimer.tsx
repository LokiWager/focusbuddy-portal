import {
  FocusSessionType,
  FocusSessionStatus,
  UserStatus,
  useAddFocusSession,
  useUpdateFocusSession,
  useUpdateUserStatus,
} from "@/common/api/api";
import { useState, useEffect } from "react";
import { browser } from "wxt/browser";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/common/components/ui/dropdown-menu";
import { Button } from "@/common/components/ui/button";
import CountdownTimer from "./CountdownTimer";

const SETTINGS_URL = browser.runtime.getURL("/dashboard.html#/Focustimer");

const FocusTimer = () => {
  const [currentState, setCurrentState] = useState<"idle" | "focus" | "rest">(
    "idle",
  );
  const [focusLength, setFocusLength] = useState<number>(30);
  const [breakLength, setBreakLength] = useState<number>(10);
  const [focusType, setFocusType] = useState<string>("Choose a focus type");
  const [remainingFocusTime, setRemainingFocusTime] = useState<number>(
    focusLength * 60,
  );
  const [remainingBreakTime, setRemainingBreakTime] = useState<number>(
    breakLength * 60,
  );
  const [startClicked, setStartClicked] = useState<boolean>(false);
  const [port, setPort] = useState<chrome.runtime.Port | null>(null);
  const [sessionId, setSessionId] = useState<string>("");

  const addMutation = useAddFocusSession();
  const updateMutation = useUpdateFocusSession();
  const updateStatusMutation = useUpdateUserStatus();

  useEffect(() => {
    // Connect to the background script
    const backgroundPort = chrome.runtime.connect({ name: "focusTimer" });
    console.log("Connecting to background...");
    setPort(backgroundPort);

    // Listen for messages from the background
    backgroundPort.onMessage.addListener((message) => {
      if (message.type === "STATE_UPDATE") {
        setCurrentState(message.currentState);
        setFocusLength(message.focusLength);
        setBreakLength(message.breakLength);
        setFocusType(message.focusType);
        setRemainingFocusTime(message.remainingFocusTime);
        setRemainingBreakTime(message.remainingBreakTime);
        // Store information for BlockList to use
        chrome.storage.local.set({
          focusState: message.currentState,
          focusType: message.focusType,
        });
        setSessionId(message.sessionId);
      } else if (message.type === "TIMER_UPDATE") {
        setRemainingFocusTime(message.remainingFocusTime);
        setRemainingBreakTime(message.remainingBreakTime);
      } else if (message.type === "SESSION_COMPLETE") {
        setCurrentState("idle");
        setFocusType("Choose a focus type");
        setFocusLength(30);
        setBreakLength(10);
        chrome.storage.local.set({
          focusState: "idle",
          focusType: "Choose a focus type",
        });
        chrome.storage.local.set({
          focusState: "idle",
          focusType: "Choose a focus type",
        });
      }
    });

    // Send initial state request
    backgroundPort.postMessage({ type: "GET_STATE" });

    // Cleanup on component unmount
    return () => {
      if (backgroundPort) {
        backgroundPort.disconnect();
      }
    };
  }, []);

  const idleState = () => {
    setCurrentState("idle");
    setFocusType("Choose a focus type");
    setFocusLength(30);
    setBreakLength(10);
  };

  const startFocusState = () => {
    setCurrentState("focus");
    setRemainingFocusTime(focusLength * 60);
    setRemainingBreakTime(breakLength * 60);
  };

  const backToFocusState = () => {
    setCurrentState("focus");
  };

  const restState = () => {
    setCurrentState("rest");
  };

  const focusSettings = () => {
    window.open(SETTINGS_URL, "_blank");
  };

  const incrementFocusLength = () => {
    setFocusLength(focusLength + 5);
  };

  const decrementFocusLength = () => {
    if (focusLength > 5) {
      setFocusLength(focusLength - 5);
    }
  };

  const incrementBreakLength = () => {
    setBreakLength(breakLength + 5);
  };

  const decrementBreakLength = () => {
    if (breakLength > 5) {
      setBreakLength(breakLength - 5);
    }
  };

  const handleFocusTypeChange = (value: string) => {
    setFocusType(value);
  };

  const startFocus = () => {
    setStartClicked(true);
    if (focusLength > 0 && focusType != "Choose a focus type") {
      const now = new Date();
      const formattedDate = now.toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
      });
      const formattedTime = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
      const request = {
        session_status: FocusSessionStatus.Ongoing,
        start_date: formattedDate,
        start_time: formattedTime,
        duration: focusLength,
        break_duration: breakLength,
        session_type:
          FocusSessionType[focusType as keyof typeof FocusSessionType],
        remaining_focus_time: focusLength * 60,
        remaining_break_time: breakLength * 60,
      };
      addMutation.mutate(request, {
        onError(err) {
          console.error(err);
        },
        onSuccess(data) {
          console.log(data);
          setSessionId(data.id);

          startFocusState();
          port?.postMessage({
            type: "START_FOCUS",
            focusLength,
            breakLength,
            focusType,
            sessionId: data.id,
          });
        },
      });
      updateStatusMutation.mutate(
        UserStatus[focusType as keyof typeof UserStatus],
        {
          onError(err) {
            console.error(err);
          },
        },
      );

      setStartClicked(false);
    }
  };

  const startBreak = () => {
    const request = {
      session_status: FocusSessionStatus.Paused,
      remaining_focus_time: remainingFocusTime,
      remaining_break_time: remainingBreakTime,
    };
    updateMutation.mutate(
      { sessionId, data: request },
      {
        onError(err) {
          console.error(err);
        },
        onSuccess(data) {
          console.log(data);
          restState();
          port?.postMessage({ type: "START_BREAK" });
        },
      },
    );
    updateStatusMutation.mutate(UserStatus.Idle, {
      onError(err) {
        console.error(err);
      },
    });
  };

  const endBreak = () => {
    const request = {
      session_status: FocusSessionStatus.Ongoing,
      remaining_focus_time: remainingFocusTime,
      remaining_break_time: remainingBreakTime,
    };
    updateMutation.mutate(
      { sessionId, data: request },
      {
        onError(err) {
          console.error(err);
        },
        onSuccess(data) {
          console.log(data);
          backToFocusState();
          port?.postMessage({ type: "END_BREAK" });
        },
      },
    );
    updateStatusMutation.mutate(
      UserStatus[focusType as keyof typeof UserStatus],
      {
        onError(err) {
          console.error(err);
        },
      },
    );
  };

  const completeSession = () => {
    const request = {
      session_status: FocusSessionStatus.Completed,
      remaining_focus_time: remainingFocusTime,
      remaining_break_time: remainingBreakTime,
    };
    updateMutation.mutate(
      { sessionId, data: request },
      {
        onError(err) {
          console.error(err);
        },
        onSuccess(data) {
          console.log(data);
          idleState();
          port?.postMessage({ type: "STOP_SESSION" });
        },
      },
    );
    if (currentState !== "rest") {
      updateStatusMutation.mutate(UserStatus.Idle, {
        onError(err) {
          console.error(err);
        },
      });
    }
  };

  return (
    <div className="focus-timer-container">
      {currentState === "idle" && (
        <div className="idle-state-content" data-testid="idle-state-content">
          <p>You are not in a focus session.</p>
          <div className="focus-length-options">
            Duration:
            <button onClick={decrementFocusLength} className="decre-button">
              -
            </button>
            <div
              className={`input-container ${
                startClicked && focusLength <= 0 ? "error-border" : ""
              }`}
            >
              <input
                type="number"
                value={focusLength}
                onChange={(e) => setFocusLength(Number(e.target.value))}
              />
              <span className="input-label">min</span>
            </div>
            <button onClick={incrementFocusLength} className="incre-button">
              +
            </button>
          </div>
          {startClicked && focusLength <= 0 && (
            <span className="error-message">
              Please enter a positive duration.
            </span>
          )}

          <div className="break-length-options">
            Break:
            <button onClick={decrementBreakLength} className="decre-button">
              -
            </button>
            <div className="input-container">
              <input
                type="number"
                value={breakLength}
                onChange={(e) => setBreakLength(Number(e.target.value))}
              />
              <span className="input-label">min</span>
            </div>
            <button onClick={incrementBreakLength} className="incre-button">
              +
            </button>
          </div>

          <div className="dropdown-menu">
            Type:
            <DropdownMenu>
              <DropdownMenuTrigger
                data-testid="focus-type-dropdown"
                className={
                  startClicked && focusType === "Choose a focus type"
                    ? "error-border"
                    : ""
                }
              >
                {focusType}
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleFocusTypeChange("Work")}>
                  Work
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleFocusTypeChange("Study")}
                >
                  Study
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleFocusTypeChange("Personal")}
                >
                  Personal
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleFocusTypeChange("Other")}
                >
                  Other
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {startClicked && focusType === "Choose a focus type" && (
            <span className="error-message">Please choose a focus type.</span>
          )}

          <div className="button-container">
            <Button className="button1" onClick={startFocus}>
              Start Focus
            </Button>
            <Button className="button2" onClick={focusSettings}>
              Configure Focus Settings
            </Button>
          </div>
        </div>
      )}

      {currentState === "focus" && (
        <div>
          <p>Keep it up!</p>
          <p>Time left for this focus session:</p>
          <CountdownTimer
            seconds={Math.floor(remainingFocusTime)}
            onComplete={idleState}
          />
          <div className="button-container">
            <Button
              className="button1"
              onClick={startBreak}
              disabled={remainingBreakTime <= 0}
            >
              Start Break
            </Button>
            <Button className="button2" onClick={completeSession}>
              End Current Session
            </Button>
          </div>
        </div>
      )}

      {currentState === "rest" && (
        <div>
          <p>Enjoy your break!</p>
          <p>Time left for this break session:</p>
          <CountdownTimer
            seconds={Math.floor(remainingBreakTime)}
            onComplete={backToFocusState}
          />
          <div className="button-container">
            <Button className="button1" onClick={endBreak}>
              Back to Focus Session
            </Button>
            <Button className="button2" onClick={completeSession}>
              End Current Session
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FocusTimer;

import { useState } from "react";
import { browser } from "wxt/browser";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/common/components/ui/dropdown-menu";
import { Button } from "@/common/components/ui/button";
import CountdownTimer from "./countDownTimer";
  


const SETTINGS_URL = browser.runtime.getURL("/dashboard.html#/blocklist");

const FocusTimer = () => {
  const [currentState, setCurrentState] = useState<"idle" | "focus" | "rest">("idle");
  const [focusLength, setFocusLength] = useState<number>(30);
  const [breakLength, setBreakLength] = useState<number>(10);
  const [focusType, setFocusType] = useState<string>("Choose a focus type");
  const [remainingFocusTime, setRemainingFocusTime] = useState<number>(focusLength * 60); // Store time left
  const [remainingBreakTime, setRemainingBreakTime] = useState<number>(breakLength * 60); // Store time left
  const [focusPaused, setFocusPaused] = useState<boolean>(false); // Track pause state
  const [breakPaused, setBreakPaused] = useState<boolean>(false); // Track pause state
  const [startClicked, setStartClicked] = useState<boolean>(false);
  

  const idleState = () => {
    setCurrentState("idle");
    setFocusType("Choose a focus type"); // Reset focus type when going to idle
    setFocusLength(30); // Reset focus length when going to idle
    setBreakLength(10); // Reset break length when going to idle
  };

  const startFocusState = () => {
    setCurrentState("focus");
    setRemainingFocusTime(focusLength * 60); // Reset time when starting focus
    setRemainingBreakTime(breakLength * 60); // Reset time when starting focus
    setFocusPaused(false); // Reset pause state when starting focus
    setBreakPaused(true); // Reset pause state when starting focus
  };

  const backToFocusState = () => {
    setCurrentState("focus");
    setFocusPaused(false); // Reset pause state when starting focus
    setBreakPaused(true); // Reset pause state when starting focus
  };

  const restState = () => {
    setCurrentState("rest");
    setFocusPaused(true); // Reset pause state when starting focus
    setBreakPaused(false); // Reset pause state when starting focus
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
      // TODO: check for overlap sessions
      startFocusState();
      // TODO: add request to create focus session and update user status
      setStartClicked(false);
    }
  }

  const startBreak = () => {
    restState();
    // TODO: if break length is 0, let user know there's no break left
    // TODO: add request to update focus session and user status
  }

  const endBreak = () => {
    backToFocusState();
    // TODO: add request to update focus session and user status
  }

  const completeSession = () => {
    idleState();
    // TODO: add request to update focus session and user status
  }

  return (
    <div className="focus-timer-container">
      {currentState === "idle" && (
        <div className="idle-state-content">
          <p>You are not in a focus session.</p>
          <div className="focus-length-options">
            Duration:
            <button
              onClick={decrementFocusLength}
              className="decre-button">
              -
            </button>
            <div className={`input-container ${startClicked && focusLength <= 0 ? "error-border" : ""}`}>
              <input
                type="number"
                value={focusLength}
                onChange={(e) => setFocusLength(Number(e.target.value))}
              />
              <span className="input-label">min</span>
            </div>
            <button
              onClick={incrementFocusLength}
              className="incre-button">
              +
            </button>
          </div>
          {startClicked && focusLength <= 0 && <span className="error-message">Please enter a positive duration.</span>}

          <div className="break-length-options">
            Break:
            <button
              onClick={decrementBreakLength}
              className="decre-button">
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
            <button
              onClick={incrementBreakLength}
              className="incre-button">
              +
            </button>
          </div>

          <div className="dropdown-menu">
            Type:
            <DropdownMenu>
              <DropdownMenuTrigger className={startClicked && focusType === "Choose a focus type" ? "error-border" : ""}>{focusType}</DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleFocusTypeChange("Work")}>Work</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFocusTypeChange("Study")}>Study</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFocusTypeChange("Personal")}>Personal</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFocusTypeChange("Other")}>Other</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {startClicked && focusType === "Choose a focus type" && <span className="error-message">Please choose a focus type.</span>}

          <div className="button-container">
            <Button className="button1" onClick={startFocus}>Start Focus</Button>
            <Button className="button2" onClick={focusSettings}>Configure Focus Settings</Button>
          </div>
        </div>
      )}

      {currentState === "focus" && (
        <div>
          <p>Keep it up!</p>
          <p>Time left for this focus session:</p>
          <CountdownTimer
            seconds={Math.floor(remainingFocusTime)}
            onComplete={completeSession}
            onTimeUpdate={setRemainingFocusTime}
            paused={focusPaused}
          />
          <div className="button-container">
            <Button className="button1" onClick={startBreak} disabled={remainingBreakTime <= 0}>Start Break</Button>
            <Button className="button2" onClick={completeSession}>End Current Session</Button> 
          </div>
        </div>
      )}

      {currentState === "rest" && (
        <div>
          <p>Enjoy your break!</p>
          <p>Time left for this break session:</p>
          <CountdownTimer
            seconds={Math.floor(remainingBreakTime)}
            onComplete={endBreak}
            onTimeUpdate={setRemainingBreakTime}
            paused={breakPaused}
          />
          <div className="button-container">
            <Button className="button1" onClick={endBreak}>Back to Focus Session</Button>
            <Button className="button2" onClick={completeSession}>End Current Session</Button> 
          </div>
        </div>
      )}
    </div>
  );
};

export default FocusTimer;

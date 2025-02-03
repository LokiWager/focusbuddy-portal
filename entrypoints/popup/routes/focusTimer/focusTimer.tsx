import { useState } from "react";
import { browser } from "wxt/browser";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/common/components/ui/dropdown-menu";
import { Button } from "@/common/components/ui/button";
  


const SETTINGS_URL = browser.runtime.getURL("/dashboard.html#/blocklist");

const FocusTimer = () => {
  const [currentState, setCurrentState] = useState<"idle" | "focus" | "rest">("idle");
  const [focusLength, setFocusLength] = useState<number>(30);
  const [breakLength, setBreakLength] = useState<number>(10);
  const [focusType, setFocusType] = useState<string>("Choose a focus type");

  const idleState = () => {
    setCurrentState("idle");
  };
  const focusState = () => {
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
    setFocusType(value); // Update the focusType state when a dropdown option is selected
  };

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
            <input
              type="number"
              value={focusLength}
              onChange={(e) => setFocusLength(Number(e.target.value))}
              className="focus-input"
            />
            <button
              onClick={incrementFocusLength}
              className="incre-button">
              +
            </button>
          </div>


          <div className="break-length-options">
            Break:
            <button
              onClick={decrementBreakLength}
              className="decre-button">
              -
            </button>
            <input
              type="number"
              value={breakLength}
              onChange={(e) => setBreakLength(Number(e.target.value))}
              className="input"
            />
            <button
              onClick={incrementBreakLength}
              className="incre-button">
              +
            </button>
          </div>
          <div className="dropdown-menu">
            Type:
            <DropdownMenu>
              <DropdownMenuTrigger>{focusType}</DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleFocusTypeChange("Work")}>Work</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFocusTypeChange("Study")}>Study</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFocusTypeChange("Personal")}>Personal</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFocusTypeChange("Other")}>Other</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="button-container">
            <Button className="button1" onClick={focusState}>Start Focus</Button>
            <Button className="button2" onClick={focusSettings}>Configure Focus Settings</Button>
          </div>
        </div>
      )}

      {currentState === "focus" && (
        <div>
          <p>Time left for this focus session:</p>
          <button onClick={restState}>Start Break</button>
          <button onClick={idleState}>End Current Session</button>
        </div>
      )}

      {currentState === "rest" && (
        <div>
          <p>Enjoy your break!</p>
          <p>Time left for this break session:</p>
          <button onClick={focusState}>Back to Focus Session</button>
          <button onClick={idleState}>End Current Session</button>
        </div>
      )}
    </div>
  );
};

export default FocusTimer;

import { useEffect } from "react";

interface CountdownTimerProps {
  seconds: number;
  onComplete: () => void;
}

const CountdownTimer = ({ seconds, onComplete }: CountdownTimerProps) => {
  useEffect(() => {
    if (seconds <= 0) {
      onComplete();
    }
  }, [seconds, onComplete]);

  return (
    <p className="countdown-timer">
      <span style={{ fontSize: "40px", fontWeight: "bold", color: "#000" }}>
        {Math.floor(seconds / 60)}
      </span>
      <span style={{ fontSize: "20px", color: "gray", marginLeft: "4px" }}>min</span>
      <span style={{ fontSize: "40px", fontWeight: "bold", color: "#000", marginLeft: "8px" }}>
        {seconds % 60}
      </span>
      <span style={{ fontSize: "20px", color: "gray", marginLeft: "4px" }}>s</span>
    </p>
  );
};

export default CountdownTimer;


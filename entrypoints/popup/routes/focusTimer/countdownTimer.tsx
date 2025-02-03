import { useState, useEffect, useRef } from "react";

interface CountdownTimerProps {
  seconds: number;
  onComplete: () => void;
  onTimeUpdate?: (timeLeft: number) => void;
  paused?: boolean;
}

const CountdownTimer = ({ seconds, onComplete, onTimeUpdate, paused = false }: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (paused) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    if (timeLeft <= 0) {
      onComplete();
      return;
    }

    intervalRef.current = setInterval(() => {
      setTimeLeft((prevTime) => {
        const newTime = prevTime - 1;
        if (onTimeUpdate) onTimeUpdate(newTime);
        return newTime;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [paused, timeLeft, onComplete, onTimeUpdate]);

  useEffect(() => {
    if (timeLeft <= 0 && intervalRef.current) {
      clearInterval(intervalRef.current);
      onComplete();
    }
  }, [timeLeft, onComplete]);

	return (
		<p className="countdown-timer">
		<span style={{ fontSize: "40px", fontWeight: "bold", color: "#000" }}>
				{Math.floor(timeLeft / 60)}
		</span>
		<span style={{ fontSize: "20px", color: "gray", marginLeft: "4px" }}>min</span>
		<span style={{ fontSize: "40px", fontWeight: "bold", color: "#000", marginLeft: "8px" }}>
				{timeLeft % 60}
		</span>
		<span style={{ fontSize: "20px", color: "gray", marginLeft: "4px" }}>s</span>
		</p>
	);
    
};

export default CountdownTimer;

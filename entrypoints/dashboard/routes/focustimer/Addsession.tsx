import { useState } from "react";
import { NavItem } from "@/common/components/Navigation/NavItem";
import {
  useAddFocusSession,
  FocusSessionType,
  FocusSessionStatus,
} from "@/common/api/api";
import { sessionColors } from "@/entrypoints/dashboard/routes/focustimer/Focustimer";

export function Addsession() {
  const { mutateAsync: addSession } = useAddFocusSession();
  //const [sessionAdded, setSessionAdded] = useState(false);
  const getTodayDate = () => {
    const today = new Date();
    today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
    return today.toISOString().split("T")[0];
  };

  const getNextHour = () => {
    const now = new Date();
    const nextHour = now.getHours() + 1;
    return nextHour === 24 ? 0 : nextHour;
  };

  const getStartDate = () => {
    const now = new Date();
    return now.getHours() === 23
      ? new Date(now.setDate(now.getDate() + 1)).toISOString().split("T")[0]
      : getTodayDate();
  };

  const getNextMinute = () => 0;

  const [type, setType] = useState(0);
  const [startDate, setStartDate] = useState(getStartDate());
  const [startHour, setStartHour] = useState(getNextHour());
  const [startMinute, setStartMinute] = useState(getNextMinute());
  const [duration, setDuration] = useState(30);
  const [breakTime, setBreakTime] = useState(0);

  const formatDateToMMDDYYYY = (dateStr: string) => {
    const [year, month, day] = dateStr.split("-");
    return `${month}/${day}/${year}`;
  };

  const formatTimeToHHMMSS = (hour: number, minute: number) => {
    return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}:00`;
  };

  const convertMinutesToSeconds = (minutes: number) => minutes * 60;

  const handleAddSession = async () => {
    const formattedDate = formatDateToMMDDYYYY(startDate);
    const formattedTime = formatTimeToHHMMSS(startHour, startMinute);

    const inputDateTime = new Date(
      `${startDate}T${startHour.toString().padStart(2, "0")}:${startMinute.toString().padStart(2, "0")}:00`,
    );
    const now = new Date();
    if (inputDateTime < now) {
      alert("Invalid Date and Time: The selected time is in the past.");
      return;
    }

    try {
      await addSession({
        session_status: FocusSessionStatus.Upcoming,
        start_date: formattedDate,
        start_time: formattedTime,
        duration: duration,
        break_duration: breakTime,
        session_type: type as FocusSessionType,
        remaining_focus_time: convertMinutesToSeconds(duration),
        remaining_break_time: convertMinutesToSeconds(breakTime),
      });

      //setSessionAdded(true);
      alert("Session added successfully!");
    } catch (error: any) {
      console.error("Failed to add focus session:", error);
      const errorMsg =
        error?.response?.data?.message ||
        error?.message ||
        "An unknown error occurred.";
      //setSessionAdded(false);
      alert(errorMsg);
    }
  };

  return (
    <div className="container mx-auto py-10 space-y-6">
      <h2 className="text-2xl font-bold">Add Session</h2>

      <div className="bg-gray-100 p-6 rounded-lg shadow space-y-6">
        {/* Type Options */}
        <div>
          <label className="block text-lg font-semibold mb-2">Type</label>
          <div className="grid grid-cols-4 gap-2">
            {["Work", "Study", "Personal", "Other"].map((label, index) => (
              <button
                key={index}
                className={`px-4 py-2 rounded-lg
                  ${type === index ? sessionColors[index] : "bg-white text-black border border-gray-300"}`}
                onClick={() => setType(index)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Start Date */}
        <div>
          <label className="block text-lg font-semibold mb-2">Start Date</label>
          <input
            data-testid="start-date"
            type="date"
            className="w-full px-4 py-2 border rounded-lg bg-white"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        {/* Start Time */}
        <div>
          <label className="block text-lg font-semibold mb-2">Start Time</label>
          <div className="flex items-center space-x-2">
            <select
              className="w-1/2 px-4 py-2 border rounded-lg bg-white"
              value={startHour}
              onChange={(e) => setStartHour(Number(e.target.value))}
            >
              {Array.from({ length: 24 }, (_, i) => i).map((hour) => (
                <option key={hour} value={hour}>
                  {hour.toString().padStart(2, "0")}
                </option>
              ))}
            </select>
            <span className="text-xl font-bold">:</span>
            <select
              className="w-1/2 px-4 py-2 border rounded-lg bg-white"
              value={startMinute}
              onChange={(e) => setStartMinute(Number(e.target.value))}
            >
              {Array.from({ length: 60 }, (_, i) => i).map((minute) => (
                <option key={minute} value={minute}>
                  {minute.toString().padStart(2, "0")}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Duration */}
        <div>
          <label className="block text-lg font-semibold mb-2">
            Duration (minutes)
          </label>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              className="w-8 h-8 flex items-center justify-center bg-[#c1cef8] rounded-full text-lg font-bold"
              onClick={() => setDuration((prev) => Math.max(1, prev - 1))}
            >
              -
            </button>
            <input
              data-testid="duration-input"
              type="number"
              className="w-16 px-4 py-2 border rounded-lg bg-white text-center"
              min="1"
              value={duration || ""}
              onKeyDown={(e) => {
                if (e.key === "-" || e.key === "e") {
                  e.preventDefault();
                }
              }}
              onChange={(e) => setDuration(Number(e.target.value))}
              onBlur={() => {
                if (!duration || isNaN(duration) || duration <= 0) {
                  setDuration(30);
                }
              }}
            />
            <button
              type="button"
              className="w-8 h-8 flex items-center justify-center bg-[#f2cdcd] rounded-full text-lg font-bold"
              onClick={() => setDuration((prev) => prev + 1)}
            >
              +
            </button>
          </div>
        </div>

        {/* Break Time */}
        <div>
          <label className="block text-lg font-semibold mb-2">
            Break Time (minutes)
          </label>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              className="w-8 h-8 flex items-center justify-center bg-[#c1cef8] rounded-full text-lg font-bold"
              onClick={() => setBreakTime((prev) => Math.max(0, prev - 1))}
            >
              -
            </button>
            <input
              data-testid="break-duration-input"
              type="number"
              className="w-16 px-4 py-2 border rounded-lg bg-white text-center"
              min="0"
              value={breakTime || ""}
              onKeyDown={(e) => {
                if (e.key === "-" || e.key === "e") {
                  e.preventDefault();
                }
              }}
              onChange={(e) => setBreakTime(Number(e.target.value))}
              onBlur={() => {
                if (!breakTime || isNaN(breakTime) || breakTime <= 0) {
                  setBreakTime(0);
                }
              }}
            />
            <button
              type="button"
              className="w-8 h-8 flex items-center justify-center bg-[#f2cdcd] rounded-full text-lg font-bold"
              onClick={() => setBreakTime((prev) => prev + 1)}
            >
              +
            </button>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-4">
          <NavItem
            to="/focustimer"
            className="bg-gray-300 !text-black text-lg px-8 py-3 rounded-lg font-semibold hover:bg-gray-200 shadow-md"
          >
            Cancel
          </NavItem>

          <NavItem
            data-testid="confirm-add-session-button"
            to="/focustimer"
            className="bg-[#f2cdcd] !text-black text-lg px-8 py-3 rounded-lg font-bold shadow-md"
            onClick={async () => {
              await handleAddSession();
            }}
          >
            Add
          </NavItem>
        </div>
      </div>
    </div>
  );
}

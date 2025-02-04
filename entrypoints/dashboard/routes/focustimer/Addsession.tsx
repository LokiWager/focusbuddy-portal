import { useState } from "react";
import { NavItem } from "@/common/components/Navigation/NavItem";

export function Addsession() {
  // initializations
  const getTodayDate = () => new Date().toLocaleDateString("en-CA");
  const getCurrentHour = () => new Date().getHours();
  const getCurrentMinute = () => new Date().getMinutes();

  const [type, setType] = useState(0); // 0: Work, 1: Study, 2: Personal, 3: Other
  const [startDate, setStartDate] = useState(getTodayDate());
  const [startHour, setStartHour] = useState(getCurrentHour());
  const [startMinute, setStartMinute] = useState(getCurrentMinute());
  const [duration, setDuration] = useState(30); // 默认 30 分钟
  const [breakTime, setBreakTime] = useState(0); // 默认 0 分钟

  // Create options for hour and minute
  const generateHourOptions = () => Array.from({ length: 24 }, (_, i) => i);
  const generateMinuteOptions = () => Array.from({ length: 60 }, (_, i) => i);

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
                className={`px-4 py-2 rounded-lg ${
                  type === index ? "bg-black text-white" : "bg-white text-black border"
                }`}
                onClick={() => setType(index)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Start Date & Start Time */}
        <div className="grid grid-cols-2 gap-6">
          {/* Start Date */}
          <div>
            <label className="block text-lg font-semibold mb-2">Start Date</label>
            <input
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
                {generateHourOptions().map((hour) => (
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
                {generateMinuteOptions().map((minute) => (
                  <option key={minute} value={minute}>
                    {minute.toString().padStart(2, "0")}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Duration */}
        <div>
          <label className="block text-lg font-semibold mb-2">Duration (minutes)</label>
          <input
            type="number"
            className="w-full px-4 py-2 border rounded-lg bg-white"
            min="1"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
          />
        </div>

        {/* Break Time */}
        <div>
          <label className="block text-lg font-semibold mb-2">Break Time (minutes)</label>
          <input
            type="number"
            className="w-full px-4 py-2 border rounded-lg bg-white"
            min="0"
            value={breakTime}
            onChange={(e) => setBreakTime(Number(e.target.value))}
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-4">
          <NavItem
            to="/focustimer"
            className="text-black px-6 py-2 rounded-lg font-semibold hover:bg-gray-200"
          >
            Cancel
          </NavItem>
          <NavItem
            to="/focustimer"
            className="bg-black text-white px-6 py-2 rounded-lg font-semibold"
          >
            Add
          </NavItem>
        </div>
      </div>
    </div>
  );
}

import { useState, useRef, useEffect } from "react";
import { NavItem } from "@/common/components/Navigation/NavItem";
import {
  useGetNextFocusSession,
  useGetAllFocusSession,
  useDeleteFocusSession,
  FocusSessionStatus,
  FocusSessionModel,
  useUpdateFocusSession,
  FocusSessionType,
} from "@/common/api/api";
import { createEvents } from "ics";

function formatStartDate(dateStr?: string): string {
  if (!dateStr) return "N/A";
  const dateObj = new Date(dateStr);
  const month = dateObj.toLocaleString("en-US", { month: "short" });
  const day = dateObj.getDate().toString().padStart(2, "0");
  return `${month} ${day}`;
}

function formatTimeRange(
  startDate?: string,
  startTime?: string,
  duration?: number,
  breakDuration?: number,
): string {
  if (
    !startDate ||
    !startTime ||
    duration === undefined ||
    breakDuration === undefined
  )
    return "N/A";
  const start = startTime.substring(0, 5);
  const startHour = parseInt(start.substring(0, 2), 10);
  const startMinute = parseInt(start.substring(3, 5), 10);
  const totalMinutes = startHour * 60 + startMinute + duration + breakDuration;
  const endHour = Math.floor(totalMinutes / 60) % 24;
  const endMinute = totalMinutes % 60;
  return `${start} - ${endHour.toString().padStart(2, "0")}:${endMinute.toString().padStart(2, "0")}`;
}

export const sessionColors: { [key: number]: string } = {
  0: "bg-[#C4E1FF] text-[#3A3A3A]", // Work
  1: "bg-[#A8E6CF] text-[#3A3A3A]", // Study
  2: "bg-[#DDDDFF] text-[#3A3A3A]", // Personal
  3: "bg-[#d0d0d0] text-[#3A3A3A]", // Other
};

export function Focustimer() {
  const { data: nextFocusSession, isLoading: isNextLoading } =
    useGetNextFocusSession();
  const { data: allFocusSessions, isLoading: isAllLoading } =
    useGetAllFocusSession(FocusSessionStatus.Upcoming);
  const { mutate: deleteSession, isPending: isDeleting } =
    useDeleteFocusSession();
  const { mutate: updateSession } = useUpdateFocusSession();

  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const [sessionToEdit, setSessionToEdit] = useState<
    (FocusSessionModel & { session_id: string }) | null
  >(null);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleDeleteSession = (sessionId?: string) => {
    if (!sessionId) return;
    setSessionToDelete(sessionId);
  };

  const confirmDelete = () => {
    if (!sessionToDelete) return;
    deleteSession(
      { sessionId: sessionToDelete },
      {
        onSuccess: () => {
          console.log(`Focus Session ${sessionToDelete} deleted successfully!`);
          setSessionToDelete(null);
        },
        onError: (error) => {
          console.error(`Failed to delete focus session:`, error);
          setSessionToDelete(null);
        },
      },
    );
  };

  const cancelDelete = () => {
    setSessionToDelete(null);
  };

  const handleEditSession = (
    session: Partial<FocusSessionModel> & { session_id: string },
  ) => {
    setSessionToEdit({
      session_id: session.session_id,
      session_status: session.session_status ?? FocusSessionStatus.Upcoming,
      start_date: session.start_date ?? "",
      start_time: session.start_time ?? "",
      duration: session.duration ?? 30,
      break_duration: session.break_duration ?? 0,
      session_type: session.session_type ?? FocusSessionType.Work,
      remaining_focus_time: session.remaining_focus_time ?? 1800,
      remaining_break_time: session.remaining_break_time ?? 0,
    });
  };

  const cancelEdit = () => {
    setSessionToEdit(null);
  };

  const confirmEdit = () => {
    if (!sessionToEdit) return;

    updateSession(
      {
        sessionId: sessionToEdit.session_id,
        data: {
          session_status: sessionToEdit.session_status,
          start_date: sessionToEdit.start_date,
          start_time: sessionToEdit.start_time,
          duration: sessionToEdit.duration,
          break_duration: sessionToEdit.break_duration,
          session_type: sessionToEdit.session_type,
          remaining_focus_time: sessionToEdit.remaining_focus_time,
          remaining_break_time: sessionToEdit.remaining_break_time,
        },
      },
      {
        onSuccess: () => {
          console.log(
            `Focus Session ${sessionToEdit.session_id} updated successfully!`,
          );
          setSessionToEdit(null);
          alert("Session updated successfully!");
        },
        onError: (error: any) => {
          //console.log("Response data:", error.response.data);
          console.error(`Failed to update focus session:`, error);
          const errorMessage =
            error?.response?.data?.message ||
            error?.message ||
            "An unknown error occurred.";
          alert(errorMessage);
          setSessionToEdit(null);
        },
      },
    );
  };

  // Converts MM/DD/YYYY → YYYY-MM-DD
  const formatDateToYYYYMMDD = (dateStr: string) => {
    const [month, day, year] = dateStr.split("/");
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  };

  // Converts YYYY-MM-DD → MM/DD/YYYY
  const formatDateToMMDDYYYY = (dateStr: string) => {
    const [year, month, day] = dateStr.split("-");
    return `${month}/${day}/${year}`;
  };

  const handleExportICS = () => {
    const sessions = allFocusSessions?.focus_sessions ?? [];

    if (sessions.length === 0) {
      alert("No upcoming sessions to export.");
      return;
    }

    const events = sessions.map((session) => {
      const [month, day, year] = session.start_date!.split("/").map(Number);
      const [hour, minute] = session.start_time!.split(":").map(Number);

      const start: [number, number, number, number, number] = [
        year,
        month,
        day,
        hour,
        minute,
      ];

      return {
        start,
        duration: { minutes: session.duration ?? 30 },
        title: `${["Work", "Study", "Personal", "Other"][session.session_type ?? 3]} Session`,
        description: "Focus Session from your schedule.",
        startOutputType: "local" as const,
      };
    });

    createEvents(events as any, (error, value) => {
      if (error) {
        console.error(error);
        alert("Failed to create ICS file.");
        return;
      }

      const blob = new Blob([value], { type: "text/calendar" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "focus_schedule.ics";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  const handleExportCSV = () => {
    const sessions = allFocusSessions?.focus_sessions ?? [];

    if (sessions.length === 0) {
      alert("No upcoming sessions to export.");
      return;
    }

    const header =
      "Subject, Start Date, Start Time, End Date, End Time, Focus Duration, Break Duration";
    const csvRows = [header];

    sessions.forEach((session) => {
      const [month, day, year] = session.start_date!.split("/").map(Number);
      const [hour, minute] = session.start_time!.split(":").map(Number);
      const duration = session.duration ?? 30;
      const break_duration = session.break_duration ?? 0;

      const startDate = `${month}/${day}/${year}`;
      const startTime = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;

      const endDateObj = new Date(
        year,
        month - 1,
        day,
        hour,
        minute + duration,
      );
      const endDate = `${endDateObj.getMonth() + 1}/${endDateObj.getDate()}/${endDateObj.getFullYear()}`;
      const endTime = `${endDateObj.getHours().toString().padStart(2, "0")}:${endDateObj.getMinutes().toString().padStart(2, "0")}`;

      const title = `${["Work", "Study", "Personal", "Other"][session.session_type ?? 3]} Session`;

      csvRows.push(
        `"${title}","${startDate}","${startTime}","${endDate}","${endTime}","${duration}","${break_duration}"`,
      );
    });

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "focus_schedule.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container mx-auto py-10 space-y-10">
      {/* Upcoming Session */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Upcoming Session</h2>
        <div className="bg-[#f5f5f5] p-4 rounded shadow min-h-[100px]">
          {isNextLoading ? (
            <div className="text-gray-600">Loading...</div>
          ) : nextFocusSession?.focus_session ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div
                  className={`w-32 text-center py-2 rounded text-xl font-bold tracking-wider shadow-md ${sessionColors[nextFocusSession.focus_session.session_type ?? 3]}`}
                >
                  {
                    ["Work", "Study", "Personal", "Other"][
                      nextFocusSession.focus_session.session_type ?? 3
                    ]
                  }
                </div>

                <div className="flex items-center space-x-4 text-lg font-semibold tracking-wide">
                  <span className="text-xl font-bold">
                    {formatStartDate(nextFocusSession.focus_session.start_date)}
                  </span>
                  <span className="text-xl font-semibold">
                    {formatTimeRange(
                      nextFocusSession.focus_session.start_date,
                      nextFocusSession.focus_session.start_time,
                      nextFocusSession.focus_session.duration,
                      nextFocusSession.focus_session.break_duration,
                    )}
                  </span>
                </div>
              </div>

              <div className="flex space-x-4">
                {/* Edit Button */}
                <button
                  className="text-black-500 cursor-pointer"
                  onClick={() => {
                    const session = nextFocusSession.focus_session;
                    if (session?.session_id) {
                      handleEditSession({
                        ...session,
                        session_id: session.session_id,
                      });
                    }
                  }}
                >
                  <img
                    src={"/icon/edit.png"}
                    alt="Edit"
                    className="w-5 h-5 cursor-pointer"
                  />
                </button>

                <button
                  className="text-black-500 cursor-pointer"
                  onClick={() =>
                    handleDeleteSession(
                      nextFocusSession.focus_session?.session_id,
                    )
                  }
                  disabled={isDeleting}
                >
                  <img
                    src={"/icon/trashcan.png"}
                    alt="Delete"
                    className="w-6 h-6 cursor-pointer"
                  />
                </button>
              </div>
            </div>
          ) : (
            <div className="text-gray-600">No Focus Session Now.</div>
          )}
        </div>
      </div>

      {/* Focus Schedule */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Focus Schedule</h2>
          <div className="flex space-x-4 items-center">
            {/* Dropdown Wrapper */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                className="bg-[#c1cef888] text-black rounded-lg px-4 py-2 font-bold shadow-md text-lg"
              >
                Export Schedule ▾
              </button>

              {isDropdownOpen && (
                <div className="absolute z-10 bg-white border shadow-md rounded-lg mt-1 w-40">
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      handleExportICS();
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                  >
                    .ics File
                  </button>
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      handleExportCSV();
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                  >
                    .csv File
                  </button>
                </div>
              )}
            </div>
            {/* Add Session Button */}
            <NavItem
              to="/focustimer/addsession"
              className="bg-[#f2cdcd] text-black rounded-lg px-4 py-2 font-bold shadow-md text-lg"
            >
              + Add Session
            </NavItem>
          </div>
        </div>

        <div className="bg-[#f5f5f5] p-4 rounded shadow space-y-4 min-h-[100px]">
          {isAllLoading ? (
            <div className="text-gray-600">Loading...</div>
          ) : (allFocusSessions?.focus_sessions ?? []).length > 0 ? (
            allFocusSessions?.focus_sessions?.map((session) => (
              <div
                key={session.session_id ?? ""}
                className="flex items-center justify-between"
              >
                <div className="flex items-center space-x-6">
                  <div
                    className={`w-32 text-center py-2 rounded text-xl font-bold tracking-wider shadow-md ${sessionColors[session.session_type ?? 3]}`}
                  >
                    {
                      ["Work", "Study", "Personal", "Other"][
                        session.session_type ?? 3
                      ]
                    }
                  </div>
                  <div className="flex items-center space-x-4 text-lg font-semibold tracking-wide">
                    <span className="text-xl font-bold">
                      {formatStartDate(session.start_date)}
                    </span>
                    <span className="text-xl font-semibold">
                      {formatTimeRange(
                        session.start_date,
                        session.start_time,
                        session.duration,
                        session.break_duration,
                      )}
                    </span>
                  </div>
                </div>

                <div className="flex space-x-4">
                  {/* Edit Button */}
                  <button
                    className="text-black-500 cursor-pointer"
                    onClick={() => {
                      if (session?.session_id) {
                        handleEditSession({
                          ...session,
                          session_id: session.session_id,
                        });
                      }
                    }}
                  >
                    <img
                      src={"/icon/edit.png"}
                      alt="Edit"
                      className="w-5 h-5 cursor-pointer"
                    />
                  </button>

                  <button
                    className="text-black-500 cursor-pointer"
                    onClick={() => handleDeleteSession(session.session_id)}
                    disabled={isDeleting}
                  >
                    <img
                      src={"/icon/trashcan.png"}
                      alt="Delete"
                      className="w-6 h-6 cursor-pointer"
                    />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-gray-600">No Focus Schedule Now.</div>
          )}
        </div>
      </div>

      {/* Edit Window */}
      {sessionToEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-[#f5f5f5] p-6 rounded-lg shadow-lg w-[400px]">
            <h3 className="text-xl font-bold mb-4 text-center">Edit Session</h3>

            {/* Type Options */}
            <div>
              <label className="block text-lg font-semibold mb-2">Type</label>
              <div className="grid grid-cols-4 gap-2">
                {["Work", "Study", "Personal", "Other"].map((label, index) => (
                  <button
                    key={index}
                    className={`px-4 py-2 rounded-lg ${
                      sessionToEdit.session_type === index
                        ? sessionColors[index]
                        : "bg-white text-black border border-gray-300"
                    }`}
                    onClick={() =>
                      setSessionToEdit((prev) =>
                        prev
                          ? { ...prev, session_type: index as FocusSessionType }
                          : prev,
                      )
                    }
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Start Date */}
            <div className="mt-4">
              <label className="block text-lg font-semibold mb-2">
                Start Date
              </label>
              <input
                type="date"
                className="w-full px-4 py-2 border rounded-lg bg-white"
                value={
                  sessionToEdit.start_date
                    ? formatDateToYYYYMMDD(sessionToEdit.start_date) // Ensure input shows YYYY-MM-DD
                    : ""
                }
                onChange={(e) =>
                  setSessionToEdit((prev) =>
                    prev
                      ? {
                          ...prev,
                          start_date: formatDateToMMDDYYYY(e.target.value),
                        }
                      : prev,
                  )
                }
              />
            </div>

            {/* Start Time */}
            <div className="mt-4">
              <label className="block text-lg font-semibold mb-2">
                Start Time
              </label>
              <div className="flex items-center space-x-2">
                <select
                  className="w-1/2 px-4 py-2 border rounded-lg bg-white"
                  value={sessionToEdit.start_time?.split(":")[0] ?? "00"}
                  onChange={(e) =>
                    setSessionToEdit((prev) =>
                      prev
                        ? {
                            ...prev,
                            start_time: `${e.target.value.padStart(
                              2,
                              "0",
                            )}:${sessionToEdit.start_time?.split(":")[1] ?? "00"}:00`,
                          }
                        : prev,
                    )
                  }
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
                  value={sessionToEdit.start_time?.split(":")[1] ?? "00"}
                  onChange={(e) =>
                    setSessionToEdit((prev) =>
                      prev
                        ? {
                            ...prev,
                            start_time: `${
                              sessionToEdit.start_time?.split(":")[0] ?? "00"
                            }:${e.target.value.padStart(2, "0")}:00`,
                          }
                        : prev,
                    )
                  }
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
            <div className="mt-4">
              <label className="block text-lg font-semibold mb-2">
                Duration (minutes)
              </label>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  className="w-8 h-8 flex items-center justify-center bg-[#c1cef8] rounded-full text-lg font-bold"
                  onClick={() =>
                    setSessionToEdit((prev) =>
                      prev
                        ? { ...prev, duration: Math.max(1, prev.duration! - 1) }
                        : prev,
                    )
                  }
                >
                  -
                </button>
                <input
                  type="number"
                  className="w-16 px-4 py-2 border rounded-lg bg-white text-center"
                  min="1"
                  value={sessionToEdit.duration ?? 30}
                  onKeyDown={(e) => {
                    if (e.key === "-" || e.key === "e") {
                      e.preventDefault();
                    }
                  }}
                  onChange={(e) =>
                    setSessionToEdit((prev) =>
                      prev
                        ? { ...prev, duration: Number(e.target.value) }
                        : prev,
                    )
                  }
                />
                <button
                  type="button"
                  className="w-8 h-8 flex items-center justify-center bg-[#f2cdcd] rounded-full text-lg font-bold"
                  onClick={() =>
                    setSessionToEdit((prev) =>
                      prev ? { ...prev, duration: prev.duration! + 1 } : prev,
                    )
                  }
                >
                  +
                </button>
              </div>
            </div>

            {/* Break Time */}
            <div className="mt-4">
              <label className="block text-lg font-semibold mb-2">
                Break Time (minutes)
              </label>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  className="w-8 h-8 flex items-center justify-center bg-[#c1cef8] rounded-full text-lg font-bold"
                  onClick={() =>
                    setSessionToEdit((prev) =>
                      prev
                        ? {
                            ...prev,
                            break_duration: Math.max(
                              0,
                              prev.break_duration! - 1,
                            ),
                          }
                        : prev,
                    )
                  }
                >
                  -
                </button>
                <input
                  type="number"
                  className="w-16 px-4 py-2 border rounded-lg bg-white text-center"
                  min="0"
                  value={sessionToEdit.break_duration ?? 0}
                  onKeyDown={(e) => {
                    if (e.key === "-" || e.key === "e") {
                      e.preventDefault();
                    }
                  }}
                  onChange={(e) =>
                    setSessionToEdit((prev) =>
                      prev
                        ? { ...prev, break_duration: Number(e.target.value) }
                        : prev,
                    )
                  }
                />
                <button
                  type="button"
                  className="w-8 h-8 flex items-center justify-center bg-[#f2cdcd] rounded-full text-lg font-bold"
                  onClick={() =>
                    setSessionToEdit((prev) =>
                      prev
                        ? { ...prev, break_duration: prev.break_duration! + 1 }
                        : prev,
                    )
                  }
                >
                  +
                </button>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-4 mt-6">
              <button
                className="bg-gray-300 text-black px-6 py-2 rounded-lg font-semibold hover:bg-gray-400 shadow-md"
                onClick={cancelEdit}
              >
                Cancel
              </button>
              <button
                className="bg-[#f2cdcd] text-black px-6 py-2 rounded-lg font-bold hover:bg-[#c1cef8] shadow-md"
                onClick={confirmEdit}
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deletion Confirmation */}
      {sessionToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-[#f5f5f5] p-6 rounded-lg shadow-lg text-center">
            <h3 className="text-xl font-bold mb-4">Are you sure?</h3>
            <p className="text-gray-600 mb-6">
              Do you really want to delete this focus session? This action
              cannot be undone.
            </p>
            <div className="flex justify-center space-x-4">
              <button
                className="bg-gray-300 text-black px-6 py-2 rounded-lg font-semibold hover:bg-gray-400 shadow-md"
                onClick={cancelDelete}
              >
                Cancel
              </button>
              <button
                className="bg-[#f2cdcd] text-black px-6 py-2 rounded-lg font-bold hover:bg-[#c1cef8] shadow-md"
                onClick={confirmDelete}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

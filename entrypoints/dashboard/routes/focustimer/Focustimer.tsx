import { useState } from "react";
import { NavItem } from "@/common/components/Navigation/NavItem";
import { useGetNextFocusSession, useGetAllFocusSession, useDeleteFocusSession } from "@/common/api/api";

function formatStartDate(dateStr?: string): string {
  if (!dateStr) return "N/A";
  const dateObj = new Date(dateStr);
  const month = dateObj.toLocaleString("en-US", { month: "short" });
  const day = dateObj.getDate().toString().padStart(2, "0");
  return `${month} ${day}`;
}


function formatTimeRange(startDate?: string, startTime?: string, duration?: number, breakDuration?: number): string {
  if (!startDate || !startTime || duration === undefined || breakDuration === undefined) return "N/A";
  const start = startTime.substring(0, 5);
  const startHour = parseInt(start.substring(0, 2), 10);
  const startMinute = parseInt(start.substring(3, 5), 10);
  const totalMinutes = startHour * 60 + startMinute + duration + breakDuration;
  const endHour = Math.floor(totalMinutes / 60) % 24;
  const endMinute = totalMinutes % 60;
  return `${start} - ${endHour.toString().padStart(2, "0")}:${endMinute.toString().padStart(2, "0")}`;
}

export function Focustimer() {
  const { data: nextFocusSession, isLoading: isNextLoading } = useGetNextFocusSession();
  const { data: allFocusSessions, isLoading: isAllLoading } = useGetAllFocusSession();
  const { mutate: deleteSession, isPending: isDeleting } = useDeleteFocusSession();

  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);

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
      }
    );
  };

  const cancelDelete = () => {
    setSessionToDelete(null);
  };

  const sessionColors: { [key: number]: string } = {
    0: "bg-[#A7C4BC] text-[#3A3A3A]", // Work
    1: "bg-[#C3B091] text-[#3A3A3A]", // Study
    2: "bg-[#D8B4A0] text-[#3A3A3A]", // Personal
    3: "bg-[#B5C0D0] text-[#3A3A3A]", // Other
  };
  
  
  return (
    <div className="container mx-auto py-10 space-y-10">
      {/* Upcoming Session */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Upcoming Session</h2>
        <div className="bg-gray-100 p-4 rounded shadow min-h-[100px]">
          {isNextLoading ? (
            <div className="text-gray-600">Loading...</div>
          ) : nextFocusSession?.focus_session ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
              <div className={`w-32 text-center py-2 rounded text-xl font-bold tracking-wider ${sessionColors[nextFocusSession.focus_session.session_type ?? 3]}`}>
                  {["Work", "Study", "Personal", "Other"][nextFocusSession.focus_session.session_type ?? 3]}
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
                      nextFocusSession.focus_session.break_duration
                    )}
                  </span>
                </div>
              </div>

              <button
                className="text-black-500 cursor-pointer"
                onClick={() => handleDeleteSession(nextFocusSession.focus_session?.session_id)}
                disabled={isDeleting}
              >
                <img 
                  src={"/icon/trashcan.png"} 
                  alt="Delete" 
                  className="w-6 h-6 cursor-pointer"
                />
              </button>
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
          <NavItem to="/focustimer/addsession" className="bg-black text-white rounded-lg px-4 py-2 font-bold">
            + Add Session
          </NavItem>
        </div>

        <div className="bg-gray-100 p-4 rounded shadow space-y-4 min-h-[100px]">
          {isAllLoading ? (
            <div className="text-gray-600">Loading...</div>
          ) : (allFocusSessions?.focus_sessions ?? []).length > 0 ? (
            allFocusSessions?.focus_sessions?.map((session) => (
              <div key={session.session_id ?? ""} className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                <div className={`w-32 text-center py-2 rounded text-xl font-bold tracking-wider ${sessionColors[session.session_type ?? 3]}`}>
                    {["Work", "Study", "Personal", "Other"][session.session_type ?? 3]}
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
                        session.break_duration
                      )}
                    </span>
                  </div>
                </div>

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
            ))
          ) : (
            <div className="text-gray-600">No Focus Schedule Now.</div>
          )}
        </div>
      </div>


      {/* Deletion Confirmation */}
      {sessionToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <h3 className="text-xl font-bold mb-4">Are you sure?</h3>
            <p className="text-gray-600 mb-6">Do you really want to delete this focus session? This action cannot be undone.</p>
            <div className="flex justify-center space-x-4">
              <button
                className="bg-gray-300 text-black px-6 py-2 rounded-lg font-semibold hover:bg-gray-400"
                onClick={cancelDelete}
              >
                Cancel
              </button>
              <button
                className="bg-red-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-600"
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

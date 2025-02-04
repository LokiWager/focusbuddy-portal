import { useListSessions, SessionModel } from "@/common/api/api";
import { FiTrash2 } from "react-icons/fi";
import { NavItem } from "@/common/components/Navigation/NavItem";

// Foramt Start Date "YYYY-MM-DD" -> "Mon dd"
function formatStartDate(dateStr: string): string {
  const dateObj = new Date(dateStr);
  const options = { month: "short", day: "numeric" } as const;
  return dateObj.toLocaleDateString("en-US", options);
}

// Foramt Focus session "HH:MM - HH:MM"
function formatTimeRange(startDate: string, startTime: string, duration: number): string {
  const start = new Date(`${startDate}T${startTime}`);
  const end = new Date(start);
  end.setMinutes(end.getMinutes() + duration);
  const options = { hour: "2-digit", minute: "2-digit", hour12: false } as const;
  return `${start.toLocaleTimeString("en-US", options)} - ${end.toLocaleTimeString("en-US", options)}`;
}

export function Focustimer() {
  const { sessions } = useListSessions();

  let sortedSessions: SessionModel[] = [];
  if (sessions && sessions.length > 0) {
    sortedSessions = [...sessions].sort((a, b) => {
      const dateA = new Date(`${a.start_date}T${a.start_time}`);
      const dateB = new Date(`${b.start_date}T${b.start_time}`);
      return dateA.getTime() - dateB.getTime();
    });
  }

  const upcomingSession = sortedSessions.length > 0 ? sortedSessions[0] : null;
  const otherSessions = sortedSessions.slice(1);

  return (
    <div className="container mx-auto py-10 space-y-10">
      {/* Upcoming Session */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Upcoming Session</h2>
        <div className="bg-gray-100 p-4 rounded shadow min-h-[100px]">
          {upcomingSession ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-gray-600 text-white w-24 text-center py-1 rounded">
                  {["Work", "Study", "Personal", "Other"][upcomingSession.type] || "Other"}
                </div>
                <div className="flex flex-col">
                  <div className="font-semibold">{formatStartDate(upcomingSession.start_date)}</div>
                  <div>{formatTimeRange(upcomingSession.start_date, upcomingSession.start_time, upcomingSession.duration)}</div>
                </div>
              </div>
              <div>
                <FiTrash2 className="text-red-500 cursor-pointer" />
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
          <NavItem to="/focustimer/addsession" className="bg-black text-white rounded-lg px-4 py-2 font-bold">
            + Add Session
          </NavItem>
        </div>
        <div className="bg-gray-100 p-4 rounded shadow space-y-4 min-h-[100px]">
          {otherSessions.length > 0 ? (
            otherSessions.map((session: SessionModel) => (
              <div key={session.session_id} className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-gray-600 text-white w-24 text-center py-1 rounded">
                    {["Work", "Study", "Personal", "Other"][session.type] || "Other"}
                  </div>
                  <div className="flex flex-col">
                    <div className="font-semibold">{formatStartDate(session.start_date)}</div>
                    <div>{formatTimeRange(session.start_date, session.start_time, session.duration)}</div>
                  </div>
                </div>
                <div>
                  <FiTrash2 className="text-red-500 cursor-pointer" />
                </div>
              </div>
            ))
          ) : (
            <div className="text-gray-600">No Focus Schedule Now.</div>
          )}
        </div>
      </div>
    </div>
  );
}

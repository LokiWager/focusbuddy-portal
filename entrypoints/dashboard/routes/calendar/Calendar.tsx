import { useEffect, useState } from "react";
import { Calendar as BigCalendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay, isSameWeek } from "date-fns";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date: Date) => startOfWeek(date, { weekStartsOn: 1 }),
  getDay,
  locales: {},
});

function parseDateOnlyString(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function isCurrentWeek(date: Date): boolean {
  return isSameWeek(date, new Date(), { weekStartsOn: 1 });
}

type CalendarEvent = {
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  color?: string;
  textColor?: string;
};

type CalendarListItem = {
  id: string;
  summary: string;
  selected: boolean;
  accessRole: string;
  backgroundColor: string;
  primary?: boolean;
};

export function Calendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<"week" | "day" | "agenda">(
    "week",
  );

  useEffect(() => {
    async function getTokenAndFetchCalendar(forceRefresh = false) {
      try {
        setLoading(true);

        // Only fetch token if it's not cached or forceRefresh is true
        const validToken = await getValidToken(forceRefresh);
        if (!validToken) {
          throw new Error("Failed to get token");
        }

        await fetchAllCalendarEvents(validToken);
        setError(null);
      } catch (err) {
        console.error("Token or calendar fetch failed:", err);
        setError("Failed to load calendar, try logging in again.");
      } finally {
        setLoading(false);
      }
    }

    async function getValidToken(
      forceRefresh: boolean,
    ): Promise<string | null> {
      if (!forceRefresh && token) {
        return token; // Use cached token
      }
      const cachedToken = await new Promise<string | null>((resolve) => {
        chrome.storage.local.get(["token"], (result) => {
          if (result.token) {
            resolve(result.token);
          } else {
            resolve(null);
          }
        });
      });

      if (cachedToken && !forceRefresh) {
        setToken(cachedToken); // Cache token in state
        return cachedToken;
      }
      return new Promise<string>((resolve, reject) => {
        chrome.identity.getAuthToken({ interactive: false }, (newToken) => {
          if (chrome.runtime.lastError || !newToken) {
            console.warn(
              "Failed to get token:",
              chrome.runtime.lastError?.message || "No token",
            );
            return reject("No valid token");
          }
          setToken(newToken); // Cache token in state
          chrome.storage.local.set({ token: newToken }, () => {});
          resolve(newToken);
        });
      });
    }

    async function fetchAllCalendarEvents(token: string) {
      const colorMeta = await fetch(
        "https://www.googleapis.com/calendar/v3/colors",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      ).then((res) => res.json());

      const calendarList = await fetch(
        "https://www.googleapis.com/calendar/v3/users/me/calendarList",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      ).then((res) => res.json());

      const calendarColors: Record<string, string> = {};
      calendarList.items.forEach((cal: CalendarListItem) => {
        calendarColors[cal.id] = cal.backgroundColor;
      });

      const timeMin = startOfWeek(new Date(), {
        weekStartsOn: 1,
      }).toISOString();

      const results = await Promise.all(
        calendarList.items
          .filter((cal: CalendarListItem) => cal.selected || cal.primary)
          .map(async (cal: CalendarListItem) => {
            const res = await fetch(
              `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(cal.id)}/events?singleEvents=true&orderBy=startTime&timeMin=${timeMin}&maxResults=250`,
              {
                headers: { Authorization: `Bearer ${token}` },
              },
            );
            const data = await res.json();
            const eventsWithColors = (data.items || []).map((event: any) => {
              const colorId = event.colorId;
              const colorInfo = colorId
                ? colorMeta.event[colorId]
                : { background: calendarColors[cal.id], foreground: "#1d1d1d" };
              let start: Date;
              let end: Date;
              const isAllDay = !!event.start?.date;
              if (isAllDay) {
                start = parseDateOnlyString(event.start.date);
                end = parseDateOnlyString(event.end.date);
              } else {
                start = new Date(event.start.dateTime);
                end = new Date(event.end.dateTime);
              }
              return {
                title: event.summary || "(No title)",
                start,
                end,
                allDay: isAllDay,
                color: colorInfo.background,
                textColor: colorInfo.foreground || "#1d1d1d",
              };
            });

            return eventsWithColors;
          }),
      );

      setEvents(results.flat());
    }
    getTokenAndFetchCalendar();
  }, []);

  const CustomToolbar = ({ onNavigate }: any) => {
    const atCurrentWeek = isCurrentWeek(currentDate);

    return (
      <div className="rbc-toolbar flex justify-start items-center gap-2">
        <span className="rbc-btn-group flex gap-2">
          {atCurrentWeek ? (
            <span className="w-10 px-2 py-1 inline-block"></span>
          ) : (
            <button
              onClick={() => onNavigate("PREV")}
              className="px-2 py-1 rounded border text-gray-800 border-gray-800 hover:bg-gray-100 active:bg-gray-200"
            >
              ‹
            </button>
          )}
          <button onClick={() => onNavigate("TODAY")}>Today</button>
          <button onClick={() => onNavigate("NEXT")}>›</button>
        </span>
      </div>
    );
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Your Upcoming Events</h1>
      <div style={{ height: "600px" }}>
        {loading ? (
          <p></p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <BigCalendar
            components={{ toolbar: CustomToolbar }}
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            view={currentView}
            onView={(view) => {
              if (view === "week" || view === "day" || view === "agenda") {
                setCurrentView(view);
              }
            }}
            date={currentDate}
            onNavigate={(date) => {
              setCurrentDate(date);
            }}
            views={["week", "day", "agenda"]}
            eventPropGetter={(event) => ({
              style: {
                backgroundColor: event.color || "#3174ad",
                color: event.textColor || "#000",
                border: "1px solid white",
                borderRadius: "8px",
                padding: "2px 4px",
              },
            })}
          />
        )}
      </div>
    </div>
  );
}

import { CalendarClock, Link2, RefreshCcw, AlertTriangle, Clock } from "lucide-react";
import { useGoogleCalendar } from "../context/GoogleCalendarContext";
import { useToast } from "../context/ToastContext";
import { isAllDay, eventStart } from "../services/googleCalendarApi";

/**
 * Today's Google Calendar meetings, shown on My Day. Read-only here — the
 * advisor manages the connection itself (and event CRUD) from Profile.
 */
export default function GoogleMeetingsSection() {
  const { isConfigured, status, connect, todaysEvents, eventsLoading, eventsError, refreshEvents } =
    useGoogleCalendar();
  const { addToast } = useToast();

  if (!isConfigured) return null;

  const handleConnect = async () => {
    try {
      await connect();
      addToast("Google Calendar connected");
    } catch (err) {
      addToast(err.message || "Could not connect to Google Calendar");
    }
  };

  const needsConnect = status !== "connected";

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy/5 text-navy">
          <CalendarClock size={16} />
        </div>
        <h2 className="text-sm font-semibold text-navy">Google Calendar</h2>
        {status === "connected" && (
          <>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
              {todaysEvents.length}
            </span>
            <button
              onClick={() => refreshEvents().catch(() => {})}
              disabled={eventsLoading}
              className="ml-auto flex items-center gap-1 text-xs font-medium text-slate-400 transition hover:text-navy"
            >
              <RefreshCcw size={11} className={eventsLoading ? "animate-spin" : ""} />
              Refresh
            </button>
          </>
        )}
      </div>

      {needsConnect ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed border-slate-200 bg-white px-4 py-4">
          <div className="flex items-start gap-2">
            {status === "expired" && <AlertTriangle size={15} className="mt-0.5 shrink-0 text-av-red" />}
            <p className="text-sm text-slate-500">
              {status === "expired"
                ? "Your Google session expired — reconnect to see today's meetings."
                : "Connect Google Calendar to see today's meetings here."}
            </p>
          </div>
          <button
            onClick={handleConnect}
            disabled={status === "connecting"}
            className="flex shrink-0 items-center gap-1.5 rounded-lg bg-navy px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-navy-light disabled:opacity-60"
          >
            <Link2 size={13} />
            {status === "connecting" ? "Connecting..." : status === "expired" ? "Reconnect" : "Connect"}
          </button>
        </div>
      ) : (
        <>
          {eventsError && <p className="mb-2 text-xs text-av-red">{eventsError.message}</p>}

          {eventsLoading && todaysEvents.length === 0 ? (
            <p className="text-sm text-slate-400">Loading your calendar...</p>
          ) : todaysEvents.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-400">
              No Google Calendar events today.
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {todaysEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
                >
                  <div className="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-lg bg-gold/10 text-[10px] font-bold leading-tight text-gold-dark">
                    {isAllDay(event) ? (
                      "ALL DAY"
                    ) : (
                      <>
                        <span>{formatHour(event)}</span>
                        <span className="font-semibold">{formatMeridiem(event)}</span>
                      </>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-navy">{event.summary || "(No title)"}</p>
                    <p className="flex items-center gap-1 truncate text-xs text-slate-400">
                      <Clock size={11} />
                      {formatRange(event)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function formatHour(event) {
  const d = eventStart(event);
  if (!d) return "";
  const h = d.getHours() % 12 === 0 ? 12 : d.getHours() % 12;
  const m = d.getMinutes();
  return m === 0 ? String(h) : `${h}:${String(m).padStart(2, "0")}`;
}

function formatMeridiem(event) {
  const d = eventStart(event);
  if (!d) return "";
  return d.getHours() >= 12 ? "PM" : "AM";
}

function formatRange(event) {
  if (isAllDay(event)) return "All day";
  const start = eventStart(event);
  const endRaw = event.end?.dateTime;
  if (!start) return "";
  const opts = { hour: "numeric", minute: "2-digit" };
  const startText = start.toLocaleTimeString("en-US", opts);
  if (!endRaw) return startText;
  return `${startText} – ${new Date(endRaw).toLocaleTimeString("en-US", opts)}`;
}

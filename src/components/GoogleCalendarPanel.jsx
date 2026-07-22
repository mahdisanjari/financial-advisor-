import { useState } from "react";
import { CalendarDays, Link2, Unlink, RefreshCcw, Plus, Pencil, Trash2, AlertTriangle } from "lucide-react";
import { useGoogleCalendar } from "../context/GoogleCalendarContext";
import { useToast } from "../context/ToastContext";
import GoogleEventForm from "./GoogleEventForm";

const STATUS_META = {
  connected: { label: "Connected", dot: "bg-av-green", text: "text-av-green" },
  connecting: { label: "Connecting…", dot: "bg-av-amber animate-pulse", text: "text-av-amber" },
  expired: { label: "Expired", dot: "bg-av-red", text: "text-av-red" },
  error: { label: "Error", dot: "bg-av-red", text: "text-av-red" },
  disconnected: { label: "Disconnected", dot: "bg-slate-300", text: "text-slate-400" },
};

export default function GoogleCalendarPanel() {
  const {
    isConfigured,
    status,
    googleEmail,
    authError,
    connect,
    disconnect,
    events,
    eventsLoading,
    eventsError,
    refreshEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    isAppEvent,
  } = useGoogleCalendar();
  const { addToast } = useToast();
  const [formMode, setFormMode] = useState(null); // null | 'create' | event object being edited
  const [deletingId, setDeletingId] = useState(null);

  if (!isConfigured) {
    return (
      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="mb-1 text-sm font-semibold text-navy">Google Calendar</h2>
        <p className="text-sm text-slate-500">
          Not configured yet — add a Google OAuth Client ID as{" "}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-navy">VITE_GOOGLE_CLIENT_ID</code> to
          enable this.
        </p>
      </section>
    );
  }

  const meta = STATUS_META[status] ?? STATUS_META.disconnected;

  const handleConnect = async () => {
    try {
      await connect();
      addToast("Google Calendar connected");
    } catch (err) {
      addToast(err.message || "Could not connect to Google Calendar");
    }
  };

  const handleDisconnect = () => {
    disconnect();
    addToast("Google Calendar disconnected");
  };

  const handleCreate = async (payload) => {
    await createEvent(payload);
    addToast("Event added to Google Calendar");
    refreshEvents().catch(() => {});
  };

  const handleUpdate = async (eventId, payload) => {
    await updateEvent(eventId, payload);
    addToast("Event updated");
    refreshEvents().catch(() => {});
  };

  const handleDelete = async (event) => {
    setDeletingId(event.id);
    try {
      await deleteEvent(event.id);
      addToast("Event deleted");
      refreshEvents().catch(() => {});
    } catch (err) {
      addToast(err.message || "Could not delete this event");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="mb-1 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-navy">Google Calendar</h2>
        <span className="flex items-center gap-1.5 text-xs font-semibold">
          <span className={`h-2 w-2 rounded-full ${meta.dot}`} />
          <span className={meta.text}>{meta.label}</span>
        </span>
      </div>
      <p className="mb-4 text-xs text-slate-400">{googleEmail || "Not connected to a Google account"}</p>

      {status === "expired" && (
        <div className="mb-4 flex items-start gap-2 rounded-lg bg-av-red/10 px-3 py-2 text-xs text-av-red">
          <AlertTriangle size={14} className="mt-0.5 shrink-0" />
          Your Google session expired. Reconnect to keep syncing meetings.
        </div>
      )}
      {status === "error" && authError && (
        <div className="mb-4 flex items-start gap-2 rounded-lg bg-av-red/10 px-3 py-2 text-xs text-av-red">
          <AlertTriangle size={14} className="mt-0.5 shrink-0" />
          {authError.message}
        </div>
      )}

      <div className="mb-4 flex flex-wrap gap-2">
        {status === "connected" ? (
          <>
            <button
              onClick={() => setFormMode("create")}
              className="flex items-center gap-1.5 rounded-lg bg-navy px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-navy-light"
            >
              <Plus size={13} />
              New Event
            </button>
            <button
              onClick={handleDisconnect}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              <Unlink size={13} />
              Disconnect
            </button>
          </>
        ) : (
          <button
            onClick={handleConnect}
            disabled={status === "connecting"}
            className="flex items-center gap-1.5 rounded-lg bg-navy px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-navy-light disabled:opacity-60"
          >
            <Link2 size={13} />
            {status === "connecting"
              ? "Connecting..."
              : status === "expired"
                ? "Reconnect Google Calendar"
                : "Connect Google Calendar"}
          </button>
        )}
      </div>

      {status === "connected" && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Next up</p>
            <button
              onClick={() => refreshEvents().catch(() => {})}
              disabled={eventsLoading}
              className="flex items-center gap-1 text-xs font-medium text-slate-400 transition hover:text-navy"
            >
              <RefreshCcw size={11} className={eventsLoading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>

          {eventsError && <p className="mb-2 text-xs text-av-red">{eventsError.message}</p>}

          {eventsLoading && events.length === 0 ? (
            <p className="text-sm text-slate-400">Loading...</p>
          ) : events.length === 0 ? (
            <p className="text-sm text-slate-400">No upcoming events on your calendar.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {events.map((event) => {
                const editable = isAppEvent(event);
                return (
                  <li key={event.id} className="flex items-start gap-2.5 rounded-lg bg-slate-50 px-3 py-2">
                    <CalendarDays size={14} className="mt-0.5 shrink-0 text-gold-dark" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-navy">{event.summary || "(No title)"}</p>
                      <p className="text-xs text-slate-400">{formatEventTime(event)}</p>
                    </div>
                    {editable && (
                      <div className="flex shrink-0 gap-1">
                        <button
                          onClick={() => setFormMode(event)}
                          aria-label="Edit event"
                          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-200 hover:text-navy"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(event)}
                          disabled={deletingId === event.id}
                          aria-label="Delete event"
                          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-av-red/10 hover:text-av-red disabled:opacity-50"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      {formMode === "create" && (
        <GoogleEventForm title="New Calendar Event" onSubmit={handleCreate} onClose={() => setFormMode(null)} submitLabel="Create" />
      )}
      {formMode && formMode !== "create" && (
        <GoogleEventForm
          title="Edit Event"
          initial={{ summary: formMode.summary, startISO: formMode.start?.dateTime }}
          onSubmit={(payload) => handleUpdate(formMode.id, payload)}
          onClose={() => setFormMode(null)}
          submitLabel="Save"
        />
      )}
    </section>
  );
}

function formatEventTime(event) {
  const raw = event.start?.dateTime || event.start?.date;
  if (!raw) return "";
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return "";
  const hasTime = Boolean(event.start?.dateTime);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    ...(hasTime ? { hour: "numeric", minute: "2-digit" } : {}),
  });
}

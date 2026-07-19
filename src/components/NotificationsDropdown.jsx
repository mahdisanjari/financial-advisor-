import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
import { useClients } from "../context/ClientsContext";
import { buildNotifications } from "../lib/notifications";

export default function NotificationsDropdown() {
  const { clients } = useClients();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  const notifications = buildNotifications(clients);

  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
        className="relative rounded-full p-2 text-slate-300 transition hover:bg-white/10 hover:text-white"
      >
        <Bell size={18} />
        {notifications.length > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-av-red px-1 text-[10px] font-bold text-white">
            {notifications.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 animate-fade-in rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
          <p className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Notifications
          </p>
          {notifications.length === 0 ? (
            <p className="px-2 py-4 text-center text-sm text-slate-400">You're all caught up.</p>
          ) : (
            <div className="flex max-h-80 flex-col gap-0.5 overflow-y-auto">
              {notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => {
                    setOpen(false);
                    navigate(`/clients/${n.clientId}`);
                  }}
                  className="flex items-start gap-2.5 rounded-lg px-2 py-2 text-left text-sm text-slate-600 transition hover:bg-slate-50"
                >
                  <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.dot}`} />
                  {n.text}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

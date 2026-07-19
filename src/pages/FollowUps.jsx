import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarClock, PhoneCall, Clock3, MessageSquareText, AlertTriangle, Calendar } from "lucide-react";
import { useClients } from "../context/ClientsContext";
import { useToast } from "../context/ToastContext";
import { getStage } from "../lib/pipeline";
import { daysAgoLabel } from "../lib/followUp";

const PRIORITY_BADGE = {
  High: "bg-av-red/10 text-av-red",
  Medium: "bg-av-amber/10 text-av-amber",
  Low: "bg-av-green/10 text-av-green",
};

const GROUPS = [
  { key: "Today", label: "Today", icon: CalendarClock },
  { key: "This week", label: "This Week", icon: Calendar },
  { key: "Overdue", label: "Overdue", icon: AlertTriangle },
];

export default function FollowUps() {
  const { clients, markContacted, snooze } = useClients();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const grouped = useMemo(
    () =>
      GROUPS.map((g) => ({
        ...g,
        clients: clients.filter((c) => c.nextFollowUp === g.key),
      })),
    [clients]
  );

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-navy">Follow-ups</h1>
        <p className="text-sm text-slate-500">Everyone waiting to hear from you, grouped by urgency.</p>
      </div>

      {grouped.map((group) => (
        <div key={group.key}>
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy/5 text-navy">
              <group.icon size={16} />
            </div>
            <h2 className="text-sm font-semibold text-navy">{group.label}</h2>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
              {group.clients.length}
            </span>
          </div>

          {group.clients.length === 0 ? (
            <p className="pl-10 text-sm text-slate-400">Nothing here.</p>
          ) : (
            <div className="flex flex-col gap-2.5">
              {group.clients.map((c) => {
                const stage = getStage(c.currentStage);
                return (
                  <div
                    key={c.id}
                    className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
                  >
                    <button
                      onClick={() => navigate(`/clients/${c.id}`)}
                      className="min-w-[160px] flex-1 text-left"
                    >
                      <p className="text-sm font-semibold text-navy">
                        {c.first} {c.last}
                      </p>
                      <p className="text-xs text-slate-400">
                        {stage?.label} · Last contact {daysAgoLabel(c.lastContactDate).toLowerCase()}
                      </p>
                    </button>

                    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${PRIORITY_BADGE[c.priority]}`}>
                      {c.priority}
                    </span>

                    <div className="flex shrink-0 flex-wrap gap-2">
                      <button
                        onClick={() => {
                          markContacted(c.id);
                          addToast(`Marked ${c.first} ${c.last} as contacted`);
                        }}
                        className="flex items-center gap-1.5 rounded-lg bg-navy px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-navy-light"
                      >
                        <PhoneCall size={13} />
                        Contacted
                      </button>
                      <button
                        onClick={() => {
                          snooze(c.id, 3);
                          addToast(`Snoozed ${c.first} ${c.last} 3 days`);
                        }}
                        className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                      >
                        <Clock3 size={13} />
                        Snooze
                      </button>
                      <button
                        onClick={() => navigate(`/clients/${c.id}?ai=1`)}
                        className="flex items-center gap-1.5 rounded-lg border border-gold/40 bg-gold/10 px-3 py-1.5 text-xs font-semibold text-gold-dark transition hover:bg-gold/20"
                      >
                        <MessageSquareText size={13} />
                        Generate Message
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

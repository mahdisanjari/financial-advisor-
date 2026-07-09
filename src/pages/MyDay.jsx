import { useMemo } from "react";
import { CalendarDays } from "lucide-react";
import { useClients } from "../context/ClientsContext";
import { PIPELINE_STAGES } from "../lib/pipeline";
import { todayLong } from "../lib/followUp";
import ClientCard from "../components/ClientCard";

export default function MyDay() {
  const { clients, doneIds, toggleDone } = useClients();

  const todaysClients = useMemo(
    () =>
      clients.filter(
        (c) =>
          c.priority === "High" || c.nextFollowUp === "Today" || c.nextFollowUp === "Overdue"
      ),
    [clients]
  );

  const doneCount = todaysClients.filter((c) => doneIds.includes(c.id)).length;
  const remainingCount = todaysClients.length - doneCount;
  const overdueCount = todaysClients.filter(
    (c) => c.nextFollowUp === "Overdue" && !doneIds.includes(c.id)
  ).length;
  const progressPct =
    todaysClients.length === 0 ? 0 : Math.round((doneCount / todaysClients.length) * 100);

  const groups = useMemo(() => {
    return PIPELINE_STAGES.map((stage) => ({
      stage,
      clients: todaysClients.filter((c) => c.currentStage === stage.id),
    })).filter((g) => g.clients.length > 0);
  }, [todaysClients]);

  return (
    <div className="flex flex-col gap-6">
      <section className="overflow-hidden rounded-2xl bg-navy px-6 py-7 text-white shadow-lg sm:px-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Your day, at a glance.</h1>
          <p className="flex items-center gap-1.5 text-sm text-slate-300">
            <CalendarDays size={15} />
            {todayLong()}
          </p>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3">
          <Stat label="Remaining" value={remainingCount} accent="text-gold" />
          <Stat label="Done" value={doneCount} accent="text-av-green" />
          <Stat label="Overdue" value={overdueCount} accent="text-av-red" />
        </div>

        <div className="mt-6">
          <div className="mb-1.5 flex items-center justify-between text-xs text-slate-300">
            <span>Today's progress</span>
            <span className="font-semibold text-white">{progressPct}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gold transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-6">
        {groups.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-400">
            Nothing urgent today. Enjoy the breathing room.
          </div>
        )}

        {groups.map(({ stage, clients: stageClients }) => {
          const Icon = stage.icon;
          return (
            <div key={stage.id}>
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy/5 text-navy">
                  <Icon size={16} />
                </div>
                <h2 className="text-sm font-semibold text-navy">{stage.label}</h2>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
                  {stageClients.length}
                </span>
              </div>
              <div className="flex flex-col gap-2.5">
                {stageClients.map((client) => (
                  <ClientCard
                    key={client.id}
                    client={client}
                    done={doneIds.includes(client.id)}
                    onToggleDone={toggleDone}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}

function Stat({ label, value, accent }) {
  return (
    <div className="rounded-xl bg-white/5 px-4 py-3 text-center">
      <p className={`text-2xl font-bold ${accent}`}>{value}</p>
      <p className="mt-0.5 text-xs text-slate-300">{label}</p>
    </div>
  );
}

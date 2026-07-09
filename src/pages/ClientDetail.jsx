import { useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { ArrowLeft, Sparkles, X, Phone, Mail, CalendarDays, Pencil } from "lucide-react";
import { useClients } from "../context/ClientsContext";
import { PIPELINE_STAGES, pipelineProgress, getStage } from "../lib/pipeline";
import { formatDate } from "../lib/followUp";
import MeetingModal from "../components/MeetingModal";

const STATUS_STYLE = {
  completed: "bg-av-green text-white",
  pending: "bg-gold text-navy",
  skipped: "bg-slate-200 text-slate-500",
  upcoming: "bg-slate-100 text-slate-400",
};

const AVATAR_BG = {
  "av-blue": "bg-av-blue",
  "av-green": "bg-av-green",
  "av-amber": "bg-av-amber",
  "av-red": "bg-av-red",
  "av-purple": "bg-av-purple",
  "av-teal": "bg-av-teal",
};

export default function ClientDetail() {
  const { id } = useParams();
  const { getClient } = useClients();
  const [searchParams, setSearchParams] = useSearchParams();
  const [aiOpen, setAiOpen] = useState(searchParams.get("ai") === "1");
  const [editingStageId, setEditingStageId] = useState(null);

  const client = getClient(id);

  if (!client) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center">
        <p className="text-sm text-slate-500">Client not found.</p>
        <Link to="/my-day" className="mt-3 inline-block text-sm font-semibold text-gold-dark">
          Back to My Day
        </Link>
      </div>
    );
  }

  const progress = pipelineProgress(client.currentStage);
  const fullName = `${client.first} ${client.last}`;

  const closeAi = () => {
    setAiOpen(false);
    searchParams.delete("ai");
    setSearchParams(searchParams, { replace: true });
  };

  return (
    <div className="flex flex-col gap-6">
      <Link to="/my-day" className="flex w-fit items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-navy">
        <ArrowLeft size={15} />
        Back to My Day
      </Link>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`flex h-14 w-14 items-center justify-center rounded-full text-lg font-bold text-white ${AVATAR_BG[client.color] ?? "bg-navy"}`}>
              {client.first[0]}
              {client.last[0]}
            </div>
            <div>
              <h1 className="text-xl font-bold text-navy">{fullName}</h1>
              <p className="text-sm text-slate-500">{client.priority} priority · Joined {formatDate(client.joined)}</p>
            </div>
          </div>
          <button
            onClick={() => setAiOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white transition hover:bg-navy-light"
          >
            <Sparkles size={15} />
            Draft Message
          </button>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 border-t border-slate-100 pt-5 sm:grid-cols-3">
          <InfoRow icon={Phone} label="Phone" value={client.phone || "—"} />
          <InfoRow icon={Mail} label="Email" value={client.email || "—"} />
          <InfoRow icon={CalendarDays} label="Last Contact" value={client.lastContact || "—"} />
        </div>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-navy">Pipeline Progress</h2>
          <span className="text-sm font-semibold text-gold-dark">{progress}%</span>
        </div>
        <div className="mb-5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-gold transition-all" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex flex-wrap gap-2">
          {PIPELINE_STAGES.map((stage) => {
            const stageState = client.stages[stage.id];
            const status = stageState?.status ?? "upcoming";
            return (
              <button
                key={stage.id}
                onClick={() => setEditingStageId(stage.id)}
                title={stageState?.date ? `Meeting: ${formatDate(stageState.date)}` : "Click to edit meeting"}
                className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition hover:opacity-80 ${STATUS_STYLE[status]}`}
              >
                {stage.short}
                <Pencil size={10} className="opacity-60" />
              </button>
            );
          })}
        </div>
      </section>

      {client.notes?.length > 0 && (
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-navy">Notes</h2>
          <div className="flex flex-col gap-3">
            {client.notes.map((note, i) => {
              const noteStage = note.stage ? getStage(note.stage) : null;
              return (
                <div key={i} className="rounded-lg bg-slate-50 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-600">{note.text}</p>
                    {noteStage && (
                      <span className="ml-3 shrink-0 rounded-full bg-navy/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-navy/60">
                        {noteStage.short}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-slate-400">{formatDate(note.date)}</p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {editingStageId && (
        <MeetingModal
          client={client}
          stage={getStage(editingStageId)}
          onClose={() => setEditingStageId(null)}
        />
      )}

      {aiOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-navy/40 backdrop-blur-sm animate-fade-in" onClick={closeAi}>
          <div
            className="h-full w-full max-w-md overflow-y-auto bg-white p-6 shadow-2xl animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-navy">
                <Sparkles size={17} className="text-gold-dark" />
                Draft Message
              </h2>
              <button
                onClick={closeAi}
                className="rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-navy"
              >
                <X size={20} />
              </button>
            </div>
            <p className="text-sm text-slate-500">
              Drafting a follow-up message for <span className="font-semibold text-navy">{fullName}</span>,
              currently in the <span className="font-semibold text-navy">{client.currentStage}</span> stage.
            </p>
            <textarea
              rows={10}
              defaultValue={`Hi ${client.first},\n\nJust following up on our last conversation...`}
              className="mt-4 w-full rounded-lg border border-slate-200 p-3 text-sm text-navy outline-none focus:border-gold focus:ring-2 focus:ring-gold/30"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
        <Icon size={15} />
      </div>
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-sm font-medium text-navy">{value}</p>
      </div>
    </div>
  );
}

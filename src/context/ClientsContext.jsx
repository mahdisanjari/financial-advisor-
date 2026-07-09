import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getDemoClients } from "../data/demoClients";
import { calcNextFollowUp } from "../lib/followUp";
import { getNextStageId } from "../lib/pipeline";

const STORAGE_KEY = "advisorpilot.clients";
const DONE_KEY = "advisorpilot.myDayDone";
const AV_COLORS = ["av-blue", "av-green", "av-amber", "av-red", "av-purple", "av-teal"];

const ClientsContext = createContext(null);

function loadClients() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn("Failed to load clients from localStorage", e);
  }
  return getDemoClients();
}

function loadDone() {
  try {
    const raw = localStorage.getItem(DONE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn("Failed to load done state from localStorage", e);
  }
  return [];
}

export function ClientsProvider({ children }) {
  const [clients, setClients] = useState(loadClients);
  const [doneIds, setDoneIds] = useState(loadDone);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem(DONE_KEY, JSON.stringify(doneIds));
  }, [doneIds]);

  const addClient = (form) => {
    const id = Date.now();
    const color = AV_COLORS[clients.length % AV_COLORS.length];
    const nextFollowUp = form.nextFollowUpDate ? calcNextFollowUp(form.nextFollowUpDate) : "TBD";

    const newClient = {
      id,
      first: form.first.trim(),
      last: form.last.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      priority: form.priority,
      color,
      joined: new Date().toISOString().slice(0, 10),
      followUpDate: form.nextFollowUpDate || "",
      nextFollowUp,
      lastContact: "Not yet contacted",
      interests: [],
      currentStage: "cp",
      stages: {
        cp: { status: "pending", data: {}, files: [] },
      },
      notes: form.notes?.trim()
        ? [{ text: form.notes.trim(), date: new Date().toISOString().slice(0, 10) }]
        : [],
    };

    setClients((prev) => [newClient, ...prev]);
    return newClient;
  };

  /**
   * Edits a stage's meeting date/outcome and optionally logs a note.
   * Marking the client's *current* stage as completed/skipped auto-advances
   * currentStage to the next stage in the pipeline.
   */
  const updateStage = (clientId, stageId, { date, status, note }) => {
    setClients((prev) =>
      prev.map((c) => {
        if (c.id !== clientId) return c;

        const stages = { ...c.stages };
        const existing = stages[stageId] ?? { data: {}, files: [] };
        stages[stageId] = { ...existing, status, date: date || existing.date };

        let currentStage = c.currentStage;
        if (stageId === c.currentStage && (status === "completed" || status === "skipped")) {
          const next = getNextStageId(stageId);
          if (next) {
            currentStage = next;
            const nextExisting = stages[next] ?? { data: {}, files: [] };
            if (nextExisting.status === "upcoming" || !nextExisting.status) {
              stages[next] = { ...nextExisting, status: "pending" };
            }
          }
        }

        const notes = note?.trim()
          ? [{ text: note.trim(), date: new Date().toISOString().slice(0, 10), stage: stageId }, ...c.notes]
          : c.notes;

        const lastContact = date
          ? `${status === "completed" ? "Met" : status === "skipped" ? "Skipped meeting" : "Scheduled"} — ${date}`
          : c.lastContact;

        return { ...c, stages, currentStage, notes, lastContact };
      })
    );
  };

  const toggleDone = (clientId) => {
    setDoneIds((prev) =>
      prev.includes(clientId) ? prev.filter((id) => id !== clientId) : [...prev, clientId]
    );
  };

  const getClient = (id) => clients.find((c) => String(c.id) === String(id));

  const value = useMemo(
    () => ({ clients, addClient, updateStage, doneIds, toggleDone, getClient }),
    [clients, doneIds]
  );

  return <ClientsContext.Provider value={value}>{children}</ClientsContext.Provider>;
}

export function useClients() {
  const ctx = useContext(ClientsContext);
  if (!ctx) throw new Error("useClients must be used within ClientsProvider");
  return ctx;
}

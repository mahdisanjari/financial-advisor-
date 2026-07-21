import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getDemoClients } from "../data/demoClients";
import { calcNextFollowUp, todayISO, addDays } from "../lib/followUp";
import { getNextStageId, PIPELINE_STAGES, FIRST_STAGE_ID } from "../lib/pipeline";

const STORAGE_KEY = "advisorpilot.clients";
const DONE_KEY = "advisorpilot.dailyTasks";
const AV_COLORS = ["av-blue", "av-green", "av-amber", "av-red", "av-purple", "av-teal"];

const ClientsContext = createContext(null);

function normalize(clients) {
  return clients.map((c) => ({
    ...c,
    nextFollowUp: c.followUpDate ? calcNextFollowUp(c.followUpDate) : c.nextFollowUp ?? "TBD",
    telegram: c.telegram ?? "",
    preferredContact: c.preferredContact ?? "phone",
    meeting: c.meeting ?? null,
    files: c.files ?? [],
    notes: c.notes ?? [],
  }));
}

function loadClients() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return normalize(JSON.parse(raw));
  } catch (e) {
    console.warn("Failed to load clients from localStorage", e);
  }
  return normalize(getDemoClients());
}

function loadDone() {
  try {
    const raw = localStorage.getItem(DONE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn("Failed to load done state from localStorage", e);
  }
  return {};
}

export function ClientsProvider({ children }) {
  const [clients, setClients] = useState(loadClients);
  const [doneTasks, setDoneTasks] = useState(loadDone);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem(DONE_KEY, JSON.stringify(doneTasks));
  }, [doneTasks]);

  const nextColor = () => AV_COLORS[clients.length % AV_COLORS.length];

  const addClient = (form) => {
    const id = Date.now();
    const nextFollowUp = form.nextFollowUpDate ? calcNextFollowUp(form.nextFollowUpDate) : "TBD";

    const newClient = {
      id,
      first: form.first.trim(),
      last: form.last.trim(),
      phone: form.phone?.trim() ?? "",
      email: form.email?.trim() ?? "",
      telegram: form.telegram?.trim() ?? "",
      preferredContact: form.preferredContact || "phone",
      priority: form.priority || "Medium",
      color: nextColor(),
      joined: todayISO(),
      followUpDate: form.nextFollowUpDate || "",
      nextFollowUp,
      lastContact: "Not yet contacted",
      lastContactDate: "",
      interests: [],
      currentStage: form.currentStage || FIRST_STAGE_ID,
      stages: { [form.currentStage || FIRST_STAGE_ID]: { status: "pending", data: {}, files: [] } },
      meeting: null,
      files: [],
      notes: form.notes?.trim() ? [{ id: Date.now(), text: form.notes.trim(), date: todayISO() }] : [],
    };

    setClients((prev) => [newClient, ...prev]);
    return newClient;
  };

  const updateClient = (clientId, patch) => {
    setClients((prev) => prev.map((c) => (c.id === clientId ? { ...c, ...patch } : c)));
  };

  const addNote = (clientId, text) => {
    if (!text?.trim()) return;
    setClients((prev) =>
      prev.map((c) =>
        c.id === clientId
          ? { ...c, notes: [{ id: Date.now(), text: text.trim(), date: todayISO() }, ...c.notes] }
          : c
      )
    );
  };

  const editNote = (clientId, noteId, text) => {
    setClients((prev) =>
      prev.map((c) =>
        c.id === clientId
          ? { ...c, notes: c.notes.map((n) => (n.id === noteId ? { ...n, text } : n)) }
          : c
      )
    );
  };

  const deleteNote = (clientId, noteId) => {
    setClients((prev) =>
      prev.map((c) => (c.id === clientId ? { ...c, notes: c.notes.filter((n) => n.id !== noteId) } : c))
    );
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
          ? [{ id: Date.now(), text: note.trim(), date: todayISO(), stage: stageId }, ...c.notes]
          : c.notes;

        const lastContact = date
          ? `${status === "completed" ? "Met" : status === "skipped" ? "Skipped meeting" : "Scheduled"} — ${date}`
          : c.lastContact;

        return { ...c, stages, currentStage, notes, lastContact };
      })
    );
  };

  const markContacted = (clientId) => {
    const today = todayISO();
    setClients((prev) =>
      prev.map((c) =>
        c.id === clientId
          ? {
              ...c,
              lastContactDate: today,
              lastContact: `Logged contact, today`,
              followUpDate: addDays(today, 7),
              nextFollowUp: calcNextFollowUp(addDays(today, 7)),
            }
          : c
      )
    );
  };

  const snooze = (clientId, days = 3) => {
    setClients((prev) =>
      prev.map((c) => {
        if (c.id !== clientId) return c;
        const newDate = addDays(c.followUpDate || todayISO(), days);
        return { ...c, followUpDate: newDate, nextFollowUp: calcNextFollowUp(newDate) };
      })
    );
  };

  const rescheduleFollowUp = (clientId, newDate) => {
    setClients((prev) =>
      prev.map((c) =>
        c.id === clientId ? { ...c, followUpDate: newDate, nextFollowUp: calcNextFollowUp(newDate) } : c
      )
    );
  };

  const rescheduleMeeting = (clientId, newDate, time) => {
    setClients((prev) =>
      prev.map((c) =>
        c.id === clientId ? { ...c, meeting: { ...(c.meeting || {}), date: newDate, time: time || c.meeting?.time } } : c
      )
    );
  };

  const toggleFileStatus = (clientId, fileId) => {
    setClients((prev) =>
      prev.map((c) =>
        c.id === clientId
          ? {
              ...c,
              files: c.files.map((f) =>
                f.id === fileId ? { ...f, status: f.status === "pending" ? "done" : "pending" } : f
              ),
            }
          : c
      )
    );
  };

  const isTaskDoneToday = (clientId, taskType) => doneTasks[`${clientId}:${taskType}`] === todayISO();

  const toggleDailyTask = (clientId, taskType) => {
    const key = `${clientId}:${taskType}`;
    setDoneTasks((prev) => {
      const next = { ...prev };
      if (next[key] === todayISO()) delete next[key];
      else next[key] = todayISO();
      return next;
    });
  };

  const importClients = (rows) => {
    const results = { successCount: 0, failedRows: [] };
    const created = [];

    rows.forEach((row, idx) => {
      const name = (row.name || row.Name || "").trim();
      if (!name) {
        results.failedRows.push({ row: idx + 1, error: "Missing Name" });
        return;
      }
      const parts = name.split(/\s+/);
      const first = parts[0];
      const last = parts.slice(1).join(" ") || "—";

      const followUpDate = row.nextFollowUp || row["Next Follow-up"] || "";
      const parsedDate = followUpDate && !Number.isNaN(new Date(followUpDate).getTime()) ? followUpDate : "";

      const rawStage = (row.stage || row.Stage || "").trim().toLowerCase();
      const matchedStage =
        PIPELINE_STAGES.find((s) => s.label.toLowerCase() === rawStage || s.id === rawStage)?.id || FIRST_STAGE_ID;

      created.push({
        id: Date.now() + idx,
        first,
        last,
        phone: row.phone || row.Phone || "",
        email: row.email || row.Email || "",
        telegram: row.telegram || row.Telegram || "",
        preferredContact: "phone",
        priority: "Medium",
        color: AV_COLORS[(clients.length + idx) % AV_COLORS.length],
        joined: todayISO(),
        followUpDate: parsedDate,
        nextFollowUp: parsedDate ? calcNextFollowUp(parsedDate) : "TBD",
        lastContact: row.lastContact || row["Last Contact"] || "Not yet contacted",
        lastContactDate: "",
        interests: [],
        currentStage: matchedStage,
        stages: { [matchedStage]: { status: "pending", data: {}, files: [] } },
        meeting: null,
        files: [],
        notes: [],
      });
      results.successCount += 1;
    });

    if (created.length) setClients((prev) => [...created, ...prev]);
    return results;
  };

  const getClient = (id) => clients.find((c) => String(c.id) === String(id));

  const value = useMemo(
    () => ({
      clients,
      addClient,
      updateClient,
      addNote,
      editNote,
      deleteNote,
      updateStage,
      markContacted,
      snooze,
      rescheduleFollowUp,
      rescheduleMeeting,
      toggleFileStatus,
      isTaskDoneToday,
      toggleDailyTask,
      importClients,
      getClient,
    }),
    [clients, doneTasks]
  );

  return <ClientsContext.Provider value={value}>{children}</ClientsContext.Provider>;
}

export function useClients() {
  const ctx = useContext(ClientsContext);
  if (!ctx) throw new Error("useClients must be used within ClientsProvider");
  return ctx;
}

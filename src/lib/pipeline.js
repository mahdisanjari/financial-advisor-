import {
  ClipboardList,
  CalendarClock,
  Briefcase,
  MessageCircle,
  MessagesSquare,
  FileSearch,
  Target,
  RefreshCcw,
  CheckCircle2,
} from "lucide-react";

export const PIPELINE_STAGES = [
  { id: "cp", short: "CP", label: "Client Planning", icon: ClipboardList },
  { id: "setmeet", short: "Set Meeting", label: "Set Meeting", icon: CalendarClock },
  { id: "bp", short: "BP", label: "Business Plan", icon: Briefcase },
  { id: "fc1", short: "FC1", label: "First Conversation", icon: MessageCircle },
  { id: "fc2", short: "FC2", label: "Second Conversation", icon: MessageCircle },
  { id: "fc3", short: "FC3", label: "Third Conversation", icon: MessagesSquare },
  { id: "fna", short: "FNA", label: "Financial Needs Analysis", icon: FileSearch },
  { id: "strategy", short: "Strategy", label: "Strategy", icon: Target },
  { id: "strategyfu", short: "Strategy FU", label: "Strategy Follow-up", icon: RefreshCcw },
  { id: "closing", short: "Closing", label: "Closing", icon: CheckCircle2 },
];

export const STAGE_INDEX = Object.fromEntries(
  PIPELINE_STAGES.map((s, i) => [s.id, i])
);

export function getStage(stageId) {
  return PIPELINE_STAGES.find((s) => s.id === stageId);
}

export function buildStagesForCurrent(currentStageId) {
  const currentIdx = STAGE_INDEX[currentStageId] ?? 0;
  const stages = {};
  PIPELINE_STAGES.forEach((stage, idx) => {
    let status = "upcoming";
    if (idx < currentIdx) status = "completed";
    else if (idx === currentIdx) status = "pending";
    stages[stage.id] = { status, data: {}, files: [] };
  });
  return stages;
}

export function getNextStageId(stageId) {
  const idx = STAGE_INDEX[stageId];
  if (idx === undefined || idx >= PIPELINE_STAGES.length - 1) return null;
  return PIPELINE_STAGES[idx + 1].id;
}

export function pipelineProgress(currentStageId) {
  const idx = STAGE_INDEX[currentStageId] ?? 0;
  return Math.round(((idx + 1) / PIPELINE_STAGES.length) * 100);
}

import {
  UserPlus,
  Send,
  MessageCircle,
  ClipboardCheck,
  Clock,
  ShieldCheck,
  TrendingUp,
  Star,
} from "lucide-react";

export const PIPELINE_STAGES = [
  { id: "lead", short: "Lead", label: "Lead", icon: UserPlus },
  { id: "invited_fc1", short: "Invited", label: "Invited to FC1", icon: Send },
  { id: "fc1_completed", short: "FC1 Done", label: "FC1 Completed", icon: MessageCircle },
  { id: "fna_completed", short: "FNA Done", label: "FNA Completed", icon: ClipboardCheck },
  { id: "insurance_pending", short: "Ins. Pending", label: "Insurance Pending", icon: Clock },
  { id: "insurance_approved", short: "Ins. Approved", label: "Insurance Approved", icon: ShieldCheck },
  { id: "investment_discussion", short: "Investment", label: "Investment Discussion", icon: TrendingUp },
  { id: "client", short: "Client", label: "Client", icon: Star },
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

export function isLead(stageId) {
  return stageId !== "client";
}

export const STAGE_STATUS_META = {
  upcoming: {
    label: "Not Scheduled",
    text: "text-av-red",
    dot: "bg-av-red",
    border: "border-av-red",
    badge: "bg-av-red/10 text-av-red",
  },
  skipped: {
    label: "Skipped",
    text: "text-av-brown",
    dot: "bg-av-brown",
    border: "border-av-brown",
    badge: "bg-av-brown/10 text-av-brown",
  },
  completed: {
    label: "Completed",
    text: "text-av-green",
    dot: "bg-av-green",
    border: "border-av-green",
    badge: "bg-av-green/10 text-av-green",
  },
  pending: {
    label: "Pending",
    text: "text-av-yellow",
    dot: "bg-av-yellow",
    border: "border-av-yellow",
    badge: "bg-av-yellow/10 text-av-yellow",
  },
};

export function getStageStatusMeta(status) {
  return STAGE_STATUS_META[status] ?? STAGE_STATUS_META.upcoming;
}

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Buckets a date string into the My Day follow-up labels.
 * "This week" is exclusive of today and inclusive of the next 7 days.
 */
export function calcNextFollowUp(dateStr) {
  if (!dateStr) return "TBD";

  const target = startOfDay(dateStr);
  if (Number.isNaN(target.getTime())) return "TBD";

  const today = startOfDay(new Date());
  const diffDays = Math.round((target - today) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "Overdue";
  if (diffDays === 0) return "Today";
  if (diffDays <= 7) return "This week";
  return "Next month";
}

export function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function todayLong() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

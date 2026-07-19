function daysSince(dateStr) {
  if (!dateStr) return Infinity;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return Infinity;
  return Math.round((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
}

export function buildNotifications(clients) {
  const notifications = [];

  clients.forEach((c) => {
    if (c.nextFollowUp === "Overdue") {
      notifications.push({
        id: `overdue-${c.id}`,
        type: "overdue",
        dot: "bg-av-red",
        text: `Follow-up overdue for ${c.first} ${c.last}`,
        clientId: c.id,
      });
    }
    if (c.meeting?.date === new Date().toISOString().slice(0, 10)) {
      notifications.push({
        id: `meeting-${c.id}`,
        type: "meeting",
        dot: "bg-av-amber",
        text: `Meeting today with ${c.first} ${c.last}${c.meeting.time ? ` at ${formatTime(c.meeting.time)}` : ""}`,
        clientId: c.id,
      });
    }
    if (daysSince(c.joined) <= 2) {
      notifications.push({
        id: `lead-${c.id}`,
        type: "lead",
        dot: "bg-av-green",
        text: `New lead added: ${c.first} ${c.last}`,
        clientId: c.id,
      });
    }
  });

  return notifications;
}

function formatTime(time) {
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, "0")} ${period}`;
}

export { formatTime };

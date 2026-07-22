import { googleFetch } from "./googleApiClient";

const EVENTS_URL = "https://www.googleapis.com/calendar/v3/calendars/primary/events";

// Every event this app creates carries this private tag so we only ever
// offer to edit/delete events AdvisorPilot actually created — never a
// user's unrelated calendar entries.
const APP_SOURCE = "advisorpilot";

export function isAppEvent(event) {
  return event?.extendedProperties?.private?.source === APP_SOURCE;
}

export function listUpcomingEvents(accessToken, { maxResults = 25, timeMin, timeMax } = {}) {
  const params = new URLSearchParams({
    timeMin: timeMin || new Date().toISOString(),
    maxResults: String(maxResults),
    singleEvents: "true",
    orderBy: "startTime",
  });
  if (timeMax) params.set("timeMax", timeMax);
  return googleFetch(accessToken, `${EVENTS_URL}?${params.toString()}`).then((data) => data.items || []);
}

/** Start/end instant of an event, tolerating all-day events (`date` not `dateTime`). */
export function eventStart(event) {
  const raw = event?.start?.dateTime || event?.start?.date;
  return raw ? new Date(raw) : null;
}

export function isAllDay(event) {
  return Boolean(event?.start?.date && !event?.start?.dateTime);
}

export function isOnDate(event, day = new Date()) {
  const start = eventStart(event);
  if (!start || Number.isNaN(start.getTime())) return false;
  return (
    start.getFullYear() === day.getFullYear() &&
    start.getMonth() === day.getMonth() &&
    start.getDate() === day.getDate()
  );
}

export function createEvent(accessToken, { summary, description, startISO, endISO, clientId }) {
  return googleFetch(accessToken, EVENTS_URL, {
    method: "POST",
    body: JSON.stringify({
      summary,
      description,
      start: { dateTime: startISO },
      end: { dateTime: endISO },
      extendedProperties: {
        private: {
          source: APP_SOURCE,
          ...(clientId != null ? { advisorpilotClientId: String(clientId) } : {}),
        },
      },
    }),
  });
}

/** Only ever call with an event this app created — check `isAppEvent` first. */
export function updateEvent(accessToken, eventId, { summary, description, startISO, endISO }) {
  const patch = {};
  if (summary !== undefined) patch.summary = summary;
  if (description !== undefined) patch.description = description;
  if (startISO !== undefined) patch.start = { dateTime: startISO };
  if (endISO !== undefined) patch.end = { dateTime: endISO };

  return googleFetch(accessToken, `${EVENTS_URL}/${encodeURIComponent(eventId)}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

/** Only ever call with an event this app created — check `isAppEvent` first. */
export function deleteEvent(accessToken, eventId) {
  return googleFetch(accessToken, `${EVENTS_URL}/${encodeURIComponent(eventId)}`, {
    method: "DELETE",
  });
}

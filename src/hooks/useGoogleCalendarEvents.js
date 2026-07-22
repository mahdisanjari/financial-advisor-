import { useCallback, useState } from "react";
import { GoogleApiError } from "../services/googleApiClient";
import { createEvent, deleteEvent, isAppEvent, listUpcomingEvents, updateEvent } from "../services/googleCalendarApi";

/**
 * Event CRUD against the connected user's primary calendar. Takes the
 * `useGoogleAuth` result so token access and expiry handling stay in one
 * place — this hook never touches localStorage or the token lifecycle
 * itself, only reads/reports through `auth`.
 */
export function useGoogleCalendarEvents(auth) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const withToken = useCallback(
    async (fn) => {
      const token = auth.getAccessToken();
      if (!token) {
        auth.handleExpired();
        const err = new Error("Your Google Calendar connection expired. Reconnect to continue.");
        err.needsReconnect = true;
        throw err;
      }
      try {
        return await fn(token);
      } catch (err) {
        if (err instanceof GoogleApiError && (err.type === "expired" || err.type === "forbidden")) {
          auth.handleExpired();
          err.needsReconnect = true;
        }
        if (err instanceof GoogleApiError && err.type === "rate_limited") {
          err.retryable = true;
        }
        throw err;
      }
    },
    [auth]
  );

  const refresh = useCallback(
    async (options = {}) => {
      setLoading(true);
      setError(null);
      try {
        const items = await withToken((token) => listUpcomingEvents(token, options));
        setEvents(items);
        return items;
      } catch (err) {
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [withToken]
  );

  const create = useCallback((payload) => withToken((token) => createEvent(token, payload)), [withToken]);

  const update = useCallback(
    (eventId, patch) => withToken((token) => updateEvent(token, eventId, patch)),
    [withToken]
  );

  const remove = useCallback((eventId) => withToken((token) => deleteEvent(token, eventId)), [withToken]);

  return { events, loading, error, refresh, create, update, remove, isAppEvent };
}

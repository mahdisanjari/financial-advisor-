import { createContext, useContext, useEffect, useMemo } from "react";
import { useAuth } from "./AuthContext";
import { useGoogleAuth } from "../hooks/useGoogleAuth";
import { useGoogleCalendarEvents } from "../hooks/useGoogleCalendarEvents";
import { isOnDate } from "../services/googleCalendarApi";

const GoogleCalendarContext = createContext(null);

export function GoogleCalendarProvider({ children }) {
  const { user } = useAuth();
  const auth = useGoogleAuth(user?.email);
  const cal = useGoogleCalendarEvents(auth);

  // One shared load the moment a connection goes live, so every screen
  // (My Day, Profile) reads the same event list instead of re-fetching.
  const { status } = auth;
  const { refresh } = cal;
  useEffect(() => {
    if (status === "connected") refresh().catch(() => {});
  }, [status, refresh]);

  const value = useMemo(
    () => ({
      // connection state
      status: auth.status, // 'disconnected' | 'connecting' | 'connected' | 'expired' | 'error'
      googleEmail: auth.googleEmail,
      isConfigured: auth.isConfigured,
      authError: auth.error,
      connect: auth.connect,
      disconnect: auth.disconnect,

      // events
      events: cal.events,
      todaysEvents: cal.events.filter((event) => isOnDate(event)),
      eventsLoading: cal.loading,
      eventsError: cal.error,
      refreshEvents: cal.refresh,
      createEvent: cal.create,
      updateEvent: cal.update,
      deleteEvent: cal.remove,
      isAppEvent: cal.isAppEvent,
    }),
    [auth, cal]
  );

  return <GoogleCalendarContext.Provider value={value}>{children}</GoogleCalendarContext.Provider>;
}

export function useGoogleCalendar() {
  const ctx = useContext(GoogleCalendarContext);
  if (!ctx) throw new Error("useGoogleCalendar must be used within GoogleCalendarProvider");
  return ctx;
}

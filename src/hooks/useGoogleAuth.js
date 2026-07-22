import { useCallback, useEffect, useRef, useState } from "react";
import {
  fetchGoogleEmail,
  isGoogleAuthConfigured,
  requestAccessToken,
  revokeAccessToken,
} from "../services/googleAuth";

const META_PREFIX = "advisorpilot.googleCalendarMeta";

// Only ever: which Google account, and when it was connected. The access
// token itself never touches localStorage — it lives solely in the ref
// below, for the lifetime of this tab.
function metaKey(appUserEmail) {
  return `${META_PREFIX}.${appUserEmail || "anonymous"}`;
}

function loadMeta(appUserEmail) {
  try {
    const raw = localStorage.getItem(metaKey(appUserEmail));
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore malformed storage
  }
  return null;
}

function saveMeta(appUserEmail, meta) {
  const key = metaKey(appUserEmail);
  if (meta) localStorage.setItem(key, JSON.stringify(meta));
  else localStorage.removeItem(key);
}

/**
 * Connection state machine for one AdvisorPilot user's Google Calendar link.
 * Status: 'disconnected' | 'connecting' | 'connected' | 'expired' | 'error'.
 * Scoped per app user (`appUserEmail`) so switching AdvisorPilot accounts in
 * the same browser never leaks one advisor's Google session to another.
 */
export function useGoogleAuth(appUserEmail) {
  const [status, setStatus] = useState("disconnected");
  const [googleEmail, setGoogleEmail] = useState(null);
  const [error, setError] = useState(null);

  const tokenRef = useRef(null); // { accessToken, expiresAt } — memory only
  const expiryTimerRef = useRef(null);

  const clearExpiryTimer = () => {
    if (expiryTimerRef.current) {
      clearTimeout(expiryTimerRef.current);
      expiryTimerRef.current = null;
    }
  };

  const markExpired = useCallback(() => {
    tokenRef.current = null;
    clearExpiryTimer();
    setStatus((prev) => (prev === "disconnected" ? "disconnected" : "expired"));
  }, []);

  const scheduleExpiry = (expiresAt) => {
    clearExpiryTimer();
    const ms = Math.max(0, expiresAt - Date.now() - 5000); // flip 5s early, never late
    expiryTimerRef.current = setTimeout(markExpired, ms);
  };

  // Switching which AdvisorPilot user is logged in: drop any live token and
  // reload that user's own connection metadata (never another user's).
  useEffect(() => {
    tokenRef.current = null;
    clearExpiryTimer();
    setError(null);

    const meta = loadMeta(appUserEmail);
    if (meta?.googleEmail) {
      // We know they connected before in this browser, but the token itself
      // was never persisted — surface this as "expired" (needs reconnect)
      // rather than silently pretending nothing happened.
      setGoogleEmail(meta.googleEmail);
      setStatus("expired");
    } else {
      setGoogleEmail(null);
      setStatus("disconnected");
    }

    return clearExpiryTimer;
  }, [appUserEmail]);

  const connect = useCallback(async () => {
    if (!isGoogleAuthConfigured()) {
      const err = new Error("Google Calendar isn't configured — missing VITE_GOOGLE_CLIENT_ID.");
      setError(err);
      setStatus("error");
      throw err;
    }

    setStatus("connecting");
    setError(null);
    try {
      const token = await requestAccessToken();
      tokenRef.current = token;
      scheduleExpiry(token.expiresAt);

      const email = await fetchGoogleEmail(token.accessToken).catch(() => null);
      setGoogleEmail(email);
      setStatus("connected");
      saveMeta(appUserEmail, { googleEmail: email, connectedAt: Date.now() });
      return token;
    } catch (err) {
      tokenRef.current = null;
      clearExpiryTimer();
      setError(err);
      setStatus("error");
      throw err;
    }
  }, [appUserEmail]);

  const disconnect = useCallback(() => {
    if (tokenRef.current?.accessToken) revokeAccessToken(tokenRef.current.accessToken);
    tokenRef.current = null;
    clearExpiryTimer();
    setGoogleEmail(null);
    setStatus("disconnected");
    setError(null);
    saveMeta(appUserEmail, null);
  }, [appUserEmail]);

  /** A live, non-expired access token, or null. Never triggers a prompt. */
  const getAccessToken = useCallback(() => {
    if (tokenRef.current && Date.now() < tokenRef.current.expiresAt) {
      return tokenRef.current.accessToken;
    }
    return null;
  }, []);

  /** Called by the API layer the moment Google itself rejects a request as unauthorized. */
  const handleExpired = useCallback(() => {
    markExpired();
  }, [markExpired]);

  useEffect(() => clearExpiryTimer, []);

  return {
    status,
    googleEmail,
    error,
    isConfigured: isGoogleAuthConfigured(),
    connect,
    disconnect,
    getAccessToken,
    handleExpired,
  };
}

import { googleFetch } from "./googleApiClient";

// Calendar event scope + basic identity so we can show *which* Google
// account is connected. Deliberately narrow — no broader Google scopes.
const SCOPES = "https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/userinfo.email";
const USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";

export function getClientId() {
  return import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
}

export function isGoogleAuthConfigured() {
  return Boolean(getClientId());
}

function loadGis() {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.oauth2) {
      resolve(window.google);
      return;
    }
    const started = Date.now();
    const interval = setInterval(() => {
      if (window.google?.accounts?.oauth2) {
        clearInterval(interval);
        resolve(window.google);
      } else if (Date.now() - started > 8000) {
        clearInterval(interval);
        reject(new Error("Google Identity Services failed to load. Check your connection and try again."));
      }
    }, 100);
  });
}

// GIS's initTokenClient binds one callback at creation time, so we memoize
// the client and route each requestAccessToken() call through a single
// pending-promise slot (GIS never issues concurrent token prompts anyway).
let tokenClientPromise = null;
let pending = null;

function getTokenClient() {
  if (tokenClientPromise) return tokenClientPromise;

  tokenClientPromise = loadGis().then(
    (google) =>
      google.accounts.oauth2.initTokenClient({
        client_id: getClientId(),
        scope: SCOPES,
        callback: (response) => {
          const settle = pending;
          pending = null;
          if (!settle) return;
          if (response.error) {
            settle.reject(new Error(response.error_description || response.error));
          } else {
            settle.resolve({
              accessToken: response.access_token,
              expiresAt: Date.now() + Number(response.expires_in || 3600) * 1000,
            });
          }
        },
        error_callback: (err) => {
          const settle = pending;
          pending = null;
          settle?.reject(new Error(err?.message || "Google sign-in was cancelled."));
        },
      })
  );

  return tokenClientPromise;
}

/**
 * Opens Google's account picker + consent screen for the *current* browser
 * user and resolves with a short-lived access token. There is no backend to
 * exchange for a refresh token, so this token must stay in memory only —
 * callers are responsible for never persisting it.
 */
export async function requestAccessToken({ prompt = "consent" } = {}) {
  if (!isGoogleAuthConfigured()) {
    throw new Error("Google Calendar isn't configured — missing VITE_GOOGLE_CLIENT_ID.");
  }
  if (pending) {
    throw new Error("A Google sign-in is already in progress.");
  }

  const client = await getTokenClient();
  return new Promise((resolve, reject) => {
    pending = { resolve, reject };
    client.requestAccessToken({ prompt });
  });
}

export function revokeAccessToken(accessToken) {
  if (!accessToken || !window.google?.accounts?.oauth2) return;
  window.google.accounts.oauth2.revoke(accessToken);
}

export function fetchGoogleEmail(accessToken) {
  return googleFetch(accessToken, USERINFO_URL).then((info) => info.email || null);
}

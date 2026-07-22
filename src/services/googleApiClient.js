/**
 * Shared fetch wrapper + error classification for every Google REST call
 * (Identity userinfo endpoint and Calendar API alike). Kept dependency-free
 * — no gapi/apis.google.com client library, just fetch.
 */
export class GoogleApiError extends Error {
  constructor(message, { status, type } = {}) {
    super(message);
    this.name = "GoogleApiError";
    this.status = status;
    this.type = type; // 'expired' | 'forbidden' | 'rate_limited' | 'server_error' | 'network' | 'unknown'
  }
}

function classifyStatus(status, body) {
  if (status === 401) return "expired";
  if (status === 429) return "rate_limited";
  if (status === 403) {
    const reason = body?.error?.errors?.[0]?.reason || body?.error?.status || "";
    if (/rateLimit|quota/i.test(reason)) return "rate_limited";
    return "forbidden";
  }
  if (status >= 500) return "server_error";
  return "unknown";
}

function messageFor(type, status, body) {
  switch (type) {
    case "expired":
      return "Your Google session has expired.";
    case "forbidden":
      return "Google Calendar access was denied or revoked.";
    case "rate_limited":
      return "Google Calendar rate limit reached — try again shortly.";
    case "server_error":
      return "Google Calendar is temporarily unavailable — try again shortly.";
    default:
      return body?.error?.message || `Google Calendar request failed (${status}).`;
  }
}

export async function googleFetch(accessToken, url, options = {}) {
  let res;
  try {
    res = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
  } catch {
    throw new GoogleApiError("Couldn't reach Google — check your connection.", { type: "network" });
  }

  if (res.status === 204) return null;

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    const type = classifyStatus(res.status, body);
    throw new GoogleApiError(messageFor(type, res.status, body), { status: res.status, type });
  }

  return body;
}

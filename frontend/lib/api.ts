// e-connecto/frontend/lib/api.ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api";

function getLocalStorageToken() {
  return typeof window !== "undefined" ? localStorage.getItem("ec_access_token") : null;
}
function setLocalStorageToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem("ec_access_token", token);
  else localStorage.removeItem("ec_access_token");
}
function getRefreshToken() {
  return typeof window !== "undefined" ? localStorage.getItem("ec_refresh_token") : null;
}
function setRefreshToken(t: string | null) {
  if (typeof window === "undefined") return;
  if (t) localStorage.setItem("ec_refresh_token", t);
  else localStorage.removeItem("ec_refresh_token");
}

async function doFetch(path: string, opts: RequestInit = {}, skipRefresh = false): Promise<Response> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(opts.headers as Record<string, string> || {})
  };

  const token = getLocalStorageToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...opts, headers, credentials: "include" });

  if (res.status === 401 && !skipRefresh) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      return await doFetch(path, opts, true);
    }
  }
  return res;
}

async function tryRefresh(): Promise<boolean> {
  const refresh = getRefreshToken();
  if (!refresh) return false;
  try {
    const r = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refresh }),
    });
    if (!r.ok) {
      setLocalStorageToken(null);
      setRefreshToken(null);
      return false;
    }
    const json = await r.json();
    if (json.access_token) {
      setLocalStorageToken(json.access_token);
      return true;
    }
    return false;
  } catch (e) {
    console.error("refresh error", e);
    return false;
  }
}

// ---------------- API Helpers ----------------

export async function register(payload: { name: string; email: string; password: string }) {
  const res = await doFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw await res.json();
  const data = await res.json();
  if (data.access_token) setLocalStorageToken(data.access_token);
  if (data.refresh_token) setRefreshToken(data.refresh_token);
  return data;
}

export async function login(payload: { email: string; password: string }) {
  const res = await doFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw await res.json();
  const data = await res.json();
  if (data.access_token) setLocalStorageToken(data.access_token);
  if (data.refresh_token) setRefreshToken(data.refresh_token);
  return data;
}

export async function googleLogin(id_token: string) {
  const res = await doFetch("/auth/google", {
    method: "POST",
    body: JSON.stringify({ id_token }),
  });
  if (!res.ok) throw await res.json();
  const data = await res.json();
  if (data.access_token) setLocalStorageToken(data.access_token);
  if (data.refresh_token) setRefreshToken(data.refresh_token);
  return data;
}

export async function logout() {
  const refresh = getRefreshToken();
  try {
    if (refresh) {
      await fetch(`${API_BASE}/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refresh }),
      });
    }
  } catch (e) {
    console.warn("logout error", e);
  } finally {
    setLocalStorageToken(null);
    setRefreshToken(null);
  }
}

export async function me() {
  const res = await doFetch("/auth/me");
  if (!res.ok) throw await res.json();
  return res.json();
}

export async function submitEwaste(payload: {
  item_name: string;
  category: string;
  image_base64?: string;
  description?: string;
  location?: string;
}) {
  const res = await doFetch("/ewaste/submit", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw await res.json();
  return res.json();
}

export async function getUser(userId: string) {
  const res = await doFetch(`/user/${userId}`);
  if (!res.ok) throw await res.json();
  return res.json();
}

export async function getPendingRequests() {
  const res = await doFetch("/ewaste/pending");
  if (!res.ok) throw await res.json();
  return res.json();
}

export async function approveRequest(request_id: string, action: "approve" | "reject") {
  const res = await doFetch("/admin/approve", {
    method: "POST",
    body: JSON.stringify({ request_id, action }),
  });
  if (!res.ok) throw await res.json();
  return res.json();
}

export function getAccessToken() {
  return typeof window !== "undefined" ? localStorage.getItem("ec_access_token") : null;
}
export { tryRefresh };

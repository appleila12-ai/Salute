// Auth + Cloud sync client for Navigatore Sanitario.
// Uses Emergent-managed Google auth flow. See integration playbook.

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || "";

export const AUTH_TOKEN_KEY = "salutenav:authToken";
export const AUTH_USER_KEY = "salutenav:authUser";

export interface AuthUser {
  user_id: string;
  email: string;
  name?: string;
  picture?: string;
}

export interface AuthSessionResponse {
  session_token: string;
  user: AuthUser;
}

export interface CloudBundle {
  reports: any[];
  checklist: Record<string, boolean>;
  region?: string | null;
  updatedAt?: string | null;
}

async function req<T>(
  path: string,
  init: RequestInit,
  token?: string | null,
): Promise<T> {
  if (!BACKEND_URL) throw new Error("BACKEND_URL non configurato");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string> | undefined),
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BACKEND_URL}${path}`, { ...init, headers });
  if (!res.ok) {
    const err = new Error(`${path} ${res.status}`);
    (err as any).status = res.status;
    throw err;
  }
  return (await res.json()) as T;
}

export async function exchangeSessionId(
  sessionId: string,
): Promise<AuthSessionResponse> {
  return req<AuthSessionResponse>("/api/auth/session", {
    method: "POST",
    body: JSON.stringify({ session_id: sessionId }),
  });
}

export async function fetchMe(token: string): Promise<AuthUser> {
  return req<AuthUser>("/api/auth/me", { method: "GET" }, token);
}

export async function logoutRemote(token: string): Promise<void> {
  try {
    await req<{ ok: boolean }>("/api/auth/logout", { method: "POST" }, token);
  } catch {
    // silent — local cleanup handles it
  }
}

export async function syncUpload(
  token: string,
  payload: Partial<CloudBundle>,
): Promise<{ ok: boolean; updatedAt: string }> {
  return req(
    "/api/sync/upload",
    { method: "POST", body: JSON.stringify(payload) },
    token,
  );
}

export async function syncDownload(token: string): Promise<CloudBundle> {
  return req<CloudBundle>("/api/sync/download", { method: "GET" }, token);
}

// Extract session_id from a callback URL (hash or query).
// Emergent returns it in the hash fragment.
export function extractSessionId(url: string | null | undefined): string | null {
  if (!url) return null;
  const m = url.match(/[?#&]session_id=([^&#]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}

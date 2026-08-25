import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Platform } from "react-native";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";

import { storage } from "@/src/utils/storage";
import {
  AUTH_TOKEN_KEY,
  AUTH_USER_KEY,
  AuthUser,
  exchangeSessionId,
  extractSessionId,
  fetchMe,
  logoutRemote,
} from "@/src/lib/auth";

WebBrowser.maybeCompleteAuthSession();

type Status = "loading" | "authenticated" | "unauthenticated";

interface AuthCtx {
  status: Status;
  user: AuthUser | null;
  token: string | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  signingIn: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthCtx | undefined>(undefined);

export function useAuth(): AuthCtx {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

// Helper to build platform-specific redirect
function getRedirectUrl(): string {
  if (Platform.OS === "web") {
    // @ts-ignore - window exists on web
    return window.location.origin + "/";
  }
  return Linking.createURL("");
}

async function loadStoredUser(): Promise<AuthUser | null> {
  const raw = await storage.getItem<string>(AUTH_USER_KEY, "");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

async function persistAuth(token: string, user: AuthUser) {
  await storage.secureSet(AUTH_TOKEN_KEY, token);
  await storage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

async function clearAuth() {
  await storage.secureRemove(AUTH_TOKEN_KEY);
  await storage.removeItem(AUTH_USER_KEY);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<Status>("loading");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Guard against double-processing the same session_id
  const processedSessionIds = useRef<Set<string>>(new Set());
  // Fallback URL captured by the deep-link listener during auth
  const linkListenerUrl = useRef<string | null>(null);

  const finalizeSession = useCallback(async (sessionId: string) => {
    if (processedSessionIds.current.has(sessionId)) return;
    processedSessionIds.current.add(sessionId);
    setSigningIn(true);
    setError(null);
    try {
      const resp = await exchangeSessionId(sessionId);
      await persistAuth(resp.session_token, resp.user);
      setToken(resp.session_token);
      setUser(resp.user);
      setStatus("authenticated");
    } catch (e: any) {
      setError("Accesso non riuscito. Riprova.");
      // fall back to unauthenticated
      setStatus((s) => (s === "authenticated" ? s : "unauthenticated"));
    } finally {
      setSigningIn(false);
    }
  }, []);

  // Register deep-link listener BEFORE opening the auth session (mobile)
  useEffect(() => {
    if (Platform.OS === "web") return;
    const sub = Linking.addEventListener("url", (event) => {
      linkListenerUrl.current = event.url;
      const sid = extractSessionId(event.url);
      if (sid) finalizeSession(sid);
    });
    return () => sub.remove();
  }, [finalizeSession]);

  // Boot: on web parse URL fragment first, on native check getInitialURL,
  // then try stored token.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // 1) Web: check URL for session_id and process BEFORE stored token
        if (Platform.OS === "web") {
          // @ts-ignore
          const href: string = window.location.href;
          const sid = extractSessionId(href);
          if (sid) {
            await finalizeSession(sid);
            // Clean the URL — strip session_id from hash & search, preserve rest
            try {
              // @ts-ignore
              const url = new URL(window.location.href);
              // remove from search
              url.searchParams.delete("session_id");
              // remove from hash
              const hash = url.hash.replace(/^#/, "");
              const cleaned = hash
                .split("&")
                .filter((p) => !p.startsWith("session_id="))
                .join("&");
              url.hash = cleaned;
              // @ts-ignore
              window.history.replaceState(
                // @ts-ignore
                window.history.state,
                "",
                url.toString(),
              );
            } catch {}
            if (cancelled) return;
            return;
          }
        } else {
          // 2) Native: initial URL check (cold start via deep link)
          const initial = await Linking.getInitialURL();
          const sid = extractSessionId(initial);
          if (sid) {
            await finalizeSession(sid);
            if (cancelled) return;
            return;
          }
        }

        // 3) Try stored session_token
        const storedToken = await storage.secureGet<string>(AUTH_TOKEN_KEY, "");
        if (storedToken) {
          try {
            const me = await fetchMe(storedToken);
            if (cancelled) return;
            setToken(storedToken);
            setUser(me);
            setStatus("authenticated");
            // refresh cached user snapshot
            await storage.setItem(AUTH_USER_KEY, JSON.stringify(me));
            return;
          } catch (e: any) {
            if (e?.status === 401) {
              await clearAuth();
            } else {
              // network error → optimistically use cached user
              const cached = await loadStoredUser();
              if (cached && !cancelled) {
                setToken(storedToken);
                setUser(cached);
                setStatus("authenticated");
                return;
              }
            }
          }
        }
        if (!cancelled) setStatus("unauthenticated");
      } catch {
        if (!cancelled) setStatus("unauthenticated");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [finalizeSession]);

  const signIn = useCallback(async () => {
    setSigningIn(true);
    setError(null);
    try {
      const redirectUrl = getRedirectUrl();
      const authUrl = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(
        redirectUrl,
      )}`;

      if (Platform.OS === "web") {
        // Full-page redirect on web
        // @ts-ignore
        window.location.href = authUrl;
        return;
      }

      // Native: openAuthSessionAsync + fallbacks
      linkListenerUrl.current = null;
      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUrl);
      let callbackUrl: string | null = null;
      if ((result as any)?.url) {
        callbackUrl = (result as any).url as string;
      }
      if (!callbackUrl && linkListenerUrl.current) {
        callbackUrl = linkListenerUrl.current;
      }
      if (!callbackUrl) {
        callbackUrl = await Linking.getInitialURL();
      }
      const sid = extractSessionId(callbackUrl);
      if (sid) {
        await finalizeSession(sid);
      } else if (result.type === "cancel" || result.type === "dismiss") {
        // Actually cancelled by user
        setError(null);
      } else {
        setError("Impossibile completare l'accesso.");
      }
    } catch (e) {
      setError("Errore durante l'accesso.");
    } finally {
      setSigningIn(false);
    }
  }, [finalizeSession]);

  const signOut = useCallback(async () => {
    const t = token;
    setUser(null);
    setToken(null);
    setStatus("unauthenticated");
    await clearAuth();
    if (t) {
      // fire-and-forget
      logoutRemote(t).catch(() => {});
    }
  }, [token]);

  const value = useMemo<AuthCtx>(
    () => ({ status, user, token, signIn, signOut, signingIn, error }),
    [status, user, token, signIn, signOut, signingIn, error],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

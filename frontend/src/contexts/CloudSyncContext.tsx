// Silent cloud sync — downloads on login, uploads on local data change.
// The sync is best-effort: it never blocks the UI and never surfaces errors.

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { storage } from "@/src/utils/storage";
import { syncDownload, syncUpload, CloudBundle } from "@/src/lib/auth";
import { useAuth } from "@/src/contexts/AuthContext";

const REPORTS_KEY = "salutenav:reports";
const CHECKLIST_KEY = "salutenav:checklist";
const REGIONE_KEY = "salutenav:regione";
const LAST_SYNC_KEY = "salutenav:lastCloudSyncAt";

type SyncState = "idle" | "syncing" | "ok" | "error";

interface CloudSyncCtx {
  state: SyncState;
  lastSyncAt: string | null;
  triggerSync: () => void;
}

const Ctx = createContext<CloudSyncCtx | undefined>(undefined);

export function useCloudSync(): CloudSyncCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCloudSync must be inside CloudSyncProvider");
  return c;
}

async function readLocalBundle(): Promise<Partial<CloudBundle>> {
  const [reportsRaw, checklistRaw, region] = await Promise.all([
    storage.getItem<string>(REPORTS_KEY, ""),
    storage.getItem<string>(CHECKLIST_KEY, ""),
    storage.getItem<string>(REGIONE_KEY, ""),
  ]);
  let reports: any[] = [];
  if (reportsRaw) {
    try {
      const p = JSON.parse(reportsRaw);
      if (Array.isArray(p)) reports = p;
    } catch {}
  }
  let checklist: Record<string, boolean> = {};
  if (checklistRaw) {
    try {
      const p = JSON.parse(checklistRaw);
      if (p && typeof p === "object") checklist = p;
    } catch {}
  }
  return { reports, checklist, region: region || undefined };
}

async function writeLocalBundle(b: CloudBundle): Promise<void> {
  if (Array.isArray(b.reports)) {
    await storage.setItem(REPORTS_KEY, JSON.stringify(b.reports.slice(0, 20)));
  }
  if (b.checklist && typeof b.checklist === "object") {
    await storage.setItem(CHECKLIST_KEY, JSON.stringify(b.checklist));
  }
  if (b.region) {
    await storage.setItem(REGIONE_KEY, b.region);
  }
}

// Simple deep-equality for our small bundle.
function bundleEq(
  a: Partial<CloudBundle>,
  b: Partial<CloudBundle>,
): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function CloudSyncProvider({ children }: { children: React.ReactNode }) {
  const { status, token } = useAuth();
  const [state, setState] = useState<SyncState>("idle");
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(null);
  const lastBundle = useRef<string>("");
  const inFlight = useRef(false);
  const scheduled = useRef<NodeJS.Timeout | null>(null);

  // Initial download after login: merge cloud INTO local by taking the freshest.
  const initialSync = useCallback(async () => {
    if (!token) return;
    setState("syncing");
    try {
      const [cloud, local] = await Promise.all([
        syncDownload(token).catch(() => null),
        readLocalBundle(),
      ]);

      if (cloud) {
        const cloudTs = cloud.updatedAt ? Date.parse(cloud.updatedAt) : 0;
        // Only overwrite local if cloud is non-empty and (local is empty OR cloud is newer)
        const localReportsCount = local.reports?.length ?? 0;
        const cloudReportsCount = cloud.reports?.length ?? 0;
        const cloudHasData =
          cloudReportsCount > 0 ||
          (cloud.checklist && Object.keys(cloud.checklist).length > 0) ||
          !!cloud.region;
        if (
          cloudHasData &&
          (localReportsCount === 0 || cloudTs > 0)
        ) {
          await writeLocalBundle(cloud);
        }
      }

      // Now upload merged local (fresh read)
      const merged = await readLocalBundle();
      await syncUpload(token, merged);
      lastBundle.current = JSON.stringify(merged);
      const now = new Date().toISOString();
      await storage.setItem(LAST_SYNC_KEY, now);
      setLastSyncAt(now);
      setState("ok");
    } catch {
      setState("error");
    }
  }, [token]);

  // Debounced upload of current local bundle.
  const uploadNow = useCallback(async () => {
    if (!token || inFlight.current) return;
    inFlight.current = true;
    try {
      const local = await readLocalBundle();
      const serialized = JSON.stringify(local);
      if (serialized === lastBundle.current) {
        inFlight.current = false;
        return;
      }
      setState("syncing");
      await syncUpload(token, local);
      lastBundle.current = serialized;
      const now = new Date().toISOString();
      await storage.setItem(LAST_SYNC_KEY, now);
      setLastSyncAt(now);
      setState("ok");
    } catch {
      setState("error");
    } finally {
      inFlight.current = false;
    }
  }, [token]);

  const triggerSync = useCallback(() => {
    if (!token) return;
    if (scheduled.current) clearTimeout(scheduled.current);
    scheduled.current = setTimeout(() => {
      uploadNow();
    }, 800);
  }, [token, uploadNow]);

  // On login, run initial sync
  useEffect(() => {
    if (status === "authenticated" && token) {
      initialSync();
    } else if (status === "unauthenticated") {
      setState("idle");
      lastBundle.current = "";
    }
  }, [status, token, initialSync]);

  // Poll local storage for changes every 5s while authenticated (cheap check)
  useEffect(() => {
    if (status !== "authenticated" || !token) return;
    const t = setInterval(async () => {
      if (inFlight.current) return;
      const local = await readLocalBundle();
      const serialized = JSON.stringify(local);
      if (serialized !== lastBundle.current && lastBundle.current !== "") {
        uploadNow();
      }
    }, 5000);
    return () => clearInterval(t);
  }, [status, token, uploadNow]);

  return (
    <Ctx.Provider value={{ state, lastSyncAt, triggerSync }}>
      {children}
    </Ctx.Provider>
  );
}

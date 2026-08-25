// Persistenza condivisa della Cassaforte Referti (sblocco + file salvati)
// con notifica ai componenti sottoscritti.

import { storage } from "@/src/utils/storage";

export const VAULT_UNLOCK_KEY = "salutenav:vaultUnlocked";
export const VAULT_PENDING_KEY = "salutenav:pendingPayment";
const VAULT_FILES_KEY = "salutenav:vaultFiles";

export interface VaultFile {
  id: string;
  name: string;
  uri?: string;
  date: string;
}

type Listener = (files: VaultFile[]) => void;
const listeners = new Set<Listener>();

export function subscribeVault(cb: Listener): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

function notify(files: VaultFile[]) {
  listeners.forEach((cb) => cb(files));
}

export async function isVaultUnlocked(): Promise<boolean> {
  return (await storage.getItem<string>(VAULT_UNLOCK_KEY, "")) === "1";
}

export async function unlockVault(): Promise<void> {
  await storage.setItem(VAULT_UNLOCK_KEY, "1");
  await storage.removeItem(VAULT_PENDING_KEY);
}

export async function loadVaultFiles(): Promise<VaultFile[]> {
  const raw = await storage.getItem<string>(VAULT_FILES_KEY, "");
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as VaultFile[]) : [];
  } catch {
    return [];
  }
}

async function persist(list: VaultFile[]): Promise<void> {
  await storage.setItem(VAULT_FILES_KEY, JSON.stringify(list.slice(0, 50)));
  notify(list);
}

export async function addVaultFile(
  name: string,
  uri?: string,
): Promise<VaultFile[]> {
  const list = await loadVaultFiles();
  const entry: VaultFile = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name,
    uri,
    date: new Date().toISOString(),
  };
  const next = [entry, ...list];
  await persist(next);
  return next;
}

export async function removeVaultFileEntry(id: string): Promise<VaultFile[]> {
  const list = await loadVaultFiles();
  const next = list.filter((f) => f.id !== id);
  await persist(next);
  return next;
}

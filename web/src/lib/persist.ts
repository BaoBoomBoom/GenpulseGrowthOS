export const PERSIST_KEYS = [
  "knowledge",
  "topics",
  "content",
  "growthInsights",
  "creativeBriefs",
  "databaseEntries",
  "calendarSlots",
  "contentTasks",
  "leads",
  "deals",
  "activities",
  "agentMessages",
  "activeContentId",
] as const;

export type PersistKey = (typeof PERSIST_KEYS)[number];

export type PersistedState = {
  [K in PersistKey]?: unknown;
} & {
  updated_at?: string;
  version?: number;
};

const LOCAL_KEY = "genpulse-os-state-v1";

function apiBase() {
  const fromEnv = import.meta.env.VITE_API_BASE as string | undefined;
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  return "";
}

export type SaveStatus =
  | "idle"
  | "loading"
  | "dirty"
  | "saving"
  | "saved"
  | "error"
  | "offline";

export async function checkBackend(): Promise<{
  online: boolean;
  storage?: string;
  durable?: boolean;
}> {
  try {
    const res = await fetch(`${apiBase()}/api/health`, {
      method: "GET",
      cache: "no-store",
    });
    if (!res.ok) return { online: false };
    const data = (await res.json()) as {
      storage?: string;
      durable?: boolean;
    };
    return {
      online: true,
      storage: data.storage,
      durable: data.durable,
    };
  } catch {
    return { online: false };
  }
}

export async function loadStateFromBackend(): Promise<PersistedState | null> {
  const res = await fetch(`${apiBase()}/api/state`, {
    method: "GET",
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`load failed: ${res.status}`);
  const data = (await res.json()) as {
    exists: boolean;
    state: PersistedState | null;
  };
  if (!data.exists || !data.state) return null;
  return data.state;
}

export async function saveStateToBackend(
  state: PersistedState
): Promise<{ updated_at: string }> {
  const res = await fetch(`${apiBase()}/api/state`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ state }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`save failed: ${res.status} ${text}`);
  }
  const data = (await res.json()) as { updated_at?: string };
  return { updated_at: data.updated_at || new Date().toISOString() };
}

export function loadStateFromLocal(): PersistedState | null {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedState;
  } catch {
    return null;
  }
}

export function saveStateToLocal(state: PersistedState) {
  try {
    localStorage.setItem(
      LOCAL_KEY,
      JSON.stringify({
        ...state,
        updated_at: new Date().toISOString(),
        version: 1,
      })
    );
  } catch {
    // quota / private mode
  }
}

export function pickPersistable(snapshot: Record<string, unknown>): PersistedState {
  const out: PersistedState = { version: 1 };
  for (const key of PERSIST_KEYS) {
    if (key in snapshot) out[key] = snapshot[key];
  }
  return out;
}

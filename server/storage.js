import { createClient } from "@supabase/supabase-js";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROW_ID = "default";

function supabaseEnv() {
  const url =
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    "";
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "";
  return { url: url.trim(), key: key.trim() };
}

function fileStorePath() {
  if (process.env.OS_STORE_PATH) return process.env.OS_STORE_PATH;
  if (process.env.VERCEL) return "/tmp/genpulse-os-store.json";
  const root = join(dirname(fileURLToPath(import.meta.url)), "..");
  return join(root, "data", "os-store.json");
}

function createFileStorage() {
  const storePath = fileStorePath();
  return {
    name: process.env.VERCEL ? "vercel-/tmp" : "json-file",
    durable: !process.env.VERCEL,
    async read() {
      if (!existsSync(storePath)) return null;
      try {
        return JSON.parse(readFileSync(storePath, "utf8"));
      } catch {
        return null;
      }
    },
    async write(state) {
      const dir = dirname(storePath);
      if (!existsSync(dir) && !process.env.VERCEL) {
        mkdirSync(dir, { recursive: true });
      }
      const payload = {
        ...state,
        updated_at: new Date().toISOString(),
      };
      writeFileSync(storePath, JSON.stringify(payload, null, 2), "utf8");
      return payload;
    },
  };
}

function createSupabaseStorage(url, key) {
  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return {
    name: "supabase",
    durable: true,
    async read() {
      const { data, error } = await supabase
        .from("os_state")
        .select("payload, updated_at")
        .eq("id", ROW_ID)
        .maybeSingle();
      if (error) {
        const msg = error.message || String(error);
        if (/relation .*os_state.* does not exist/i.test(msg) || error.code === "42P01") {
          const err = new Error(
            "os_state table missing — run sql/005_os_state_snapshot.sql in Supabase"
          );
          err.code = "SCHEMA_MISSING";
          throw err;
        }
        throw error;
      }
      if (!data) return null;
      const payload =
        data.payload && typeof data.payload === "object" ? data.payload : {};
      return {
        ...payload,
        updated_at: data.updated_at || payload.updated_at,
      };
    },
    async write(state) {
      const updated_at = new Date().toISOString();
      const payload = { ...state, updated_at };
      const { error } = await supabase.from("os_state").upsert(
        {
          id: ROW_ID,
          payload,
          updated_at,
        },
        { onConflict: "id" }
      );
      if (error) {
        const msg = error.message || String(error);
        if (/relation .*os_state.* does not exist/i.test(msg) || error.code === "42P01") {
          const err = new Error(
            "os_state table missing — run sql/005_os_state_snapshot.sql in Supabase"
          );
          err.code = "SCHEMA_MISSING";
          throw err;
        }
        throw error;
      }
      return payload;
    },
  };
}

/**
 * Prefer Supabase when Vercel integration env is present; else JSON file.
 */
export function createStorage() {
  const { url, key } = supabaseEnv();
  if (url && key) return createSupabaseStorage(url, key);
  return createFileStorage();
}

export async function readEdgeConfigFlag(key, fallback = null) {
  const connection = process.env.EDGE_CONFIG;
  if (!connection) return fallback;
  try {
    const { get } = await import("@vercel/edge-config");
    const value = await get(key);
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

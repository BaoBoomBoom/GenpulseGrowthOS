import { createStorage } from "../server/storage.js";

export default async function handler(_req, res) {
  const storage = createStorage();
  res.setHeader("Content-Type", "application/json");
  res.statusCode = 200;
  res.end(
    JSON.stringify({
      ok: true,
      service: "genpulse-growth-os",
      storage: storage.name,
      durable: storage.durable,
      edge_config: Boolean(process.env.EDGE_CONFIG),
      supabase_url: Boolean(
        process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
      ),
      time: new Date().toISOString(),
    })
  );
}

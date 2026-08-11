import { Hono } from "hono";
import { cors } from "hono/cors";

/**
 * @param {{ storage: { name: string, durable: boolean, read: () => Promise<any>, write: (s: any) => Promise<any> } }} deps
 */
export function createHonoApp(deps) {
  const { storage } = deps;
  const app = new Hono().basePath("/api");

  app.use(
    "*",
    cors({
      origin: (origin) => origin || "*",
      allowMethods: ["GET", "PUT", "POST", "OPTIONS"],
      allowHeaders: ["Content-Type"],
    })
  );

  app.get("/health", async (c) => {
    let edge = false;
    try {
      const { readEdgeConfigFlag } = await import("./storage.js");
      const probe = await readEdgeConfigFlag("__ping", null);
      edge = process.env.EDGE_CONFIG ? true : false;
      void probe;
    } catch {
      edge = Boolean(process.env.EDGE_CONFIG);
    }
    return c.json({
      ok: true,
      service: "genpulse-growth-os",
      storage: storage.name,
      durable: storage.durable,
      edge_config: edge,
      time: new Date().toISOString(),
    });
  });

  app.get("/state", async (c) => {
    try {
      const state = await storage.read();
      if (!state) return c.json({ exists: false, state: null, storage: storage.name }, 200);
      return c.json({ exists: true, state, storage: storage.name }, 200);
    } catch (err) {
      return c.json(
        {
          ok: false,
          error: err?.message || String(err),
          code: err?.code || "READ_FAILED",
          storage: storage.name,
        },
        err?.code === "SCHEMA_MISSING" ? 503 : 500
      );
    }
  });

  async function saveHandler(c) {
    const body = await c.req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return c.json({ ok: false, error: "invalid body" }, 400);
    }
    const next = body.state && typeof body.state === "object" ? body.state : body;
    try {
      const saved = await storage.write(next);
      return c.json({
        ok: true,
        updated_at: saved.updated_at,
        storage: storage.name,
        durable: storage.durable,
      });
    } catch (err) {
      return c.json(
        {
          ok: false,
          error: err?.message || String(err),
          code: err?.code || "WRITE_FAILED",
          storage: storage.name,
        },
        err?.code === "SCHEMA_MISSING" ? 503 : 500
      );
    }
  }

  app.put("/state", saveHandler);
  app.post("/state", saveHandler);

  return app;
}

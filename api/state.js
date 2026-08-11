import { createHonoApp } from "../server/app.js";
import { createStorage } from "../server/storage.js";

const storage = createStorage();
const app = createHonoApp({ storage });

export default async function handler(req, res) {
  const host = req.headers.host || "localhost";
  const proto = req.headers["x-forwarded-proto"] || "https";
  // Normalize so Hono basePath /api matches /api/state and /api/health
  let path = req.url || "/";
  if (!path.startsWith("/api")) {
    // Vercel may invoke this file as /api/state ? keep as-is
    path = path.startsWith("/") ? path : `/${path}`;
  }
  const url = `${proto}://${host}${path}`;
  const method = req.method || "GET";
  let body;
  if (method !== "GET" && method !== "HEAD") {
    body =
      typeof req.body === "string"
        ? req.body
        : req.body != null
          ? JSON.stringify(req.body)
          : undefined;
  }
  const request = new Request(url, {
    method,
    headers: req.headers,
    body,
  });
  const response = await app.fetch(request);
  const text = await response.text();
  res.statusCode = response.status;
  response.headers.forEach((value, key) => {
    if (key.toLowerCase() === "transfer-encoding") return;
    res.setHeader(key, value);
  });
  res.end(text);
}

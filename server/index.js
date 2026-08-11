import { createServer } from "node:http";
import { createHonoApp } from "./app.js";
import { createStorage } from "./storage.js";

const storage = createStorage();
const app = createHonoApp({ storage });
const port = Number(process.env.PORT || 8787);

createServer(async (req, res) => {
  const host = req.headers.host || `127.0.0.1:${port}`;
  const url = `http://${host}${req.url || "/"}`;
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const body = Buffer.concat(chunks);
  const request = new Request(url, {
    method: req.method,
    headers: req.headers,
    body: ["GET", "HEAD"].includes(req.method || "GET") ? undefined : body,
  });
  const response = await app.fetch(request);
  res.statusCode = response.status;
  response.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });
  const buf = Buffer.from(await response.arrayBuffer());
  res.end(buf);
}).listen(port, "127.0.0.1", () => {
  console.log(`[os-api] listening on http://127.0.0.1:${port}`);
  console.log(`[os-api] storage: ${storage.name} (durable=${storage.durable})`);
});

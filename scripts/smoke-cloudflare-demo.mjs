import assert from "node:assert/strict";

const address = process.env.DEMO_URL ?? "";
const workerName = process.env.DEMO_WORKER_NAME ?? "";
const url = new URL(address);
if (url.protocol !== "https:" || url.username || url.password || url.port ||
    !/^[a-z0-9.-]+$/.test(url.hostname) || !url.hostname.endsWith(".workers.dev") ||
    !url.hostname.startsWith(workerName + ".") ||
    url.pathname !== "/" || url.search || url.hash) {
  throw new Error("DEMO_URL must be the HTTPS workers.dev root of the configured demo Worker");
}

async function request(path) {
  const response = await fetch(new URL(path, url), {
    redirect: "error",
    headers: { accept: path === "/" ? "text/html" : "application/json" },
    signal: AbortSignal.timeout(20_000),
  });
  assert.equal(response.status, 200, `${path}: HTTP ${response.status}`);
  return response;
}

const home = await request("/");
assert.match(await home.text(), /Uzi Cloudflare example/);
const health = await request("/api/health");
assert.deepEqual(await health.json(), { ok: true });
const items = await request("/api/items");
const body = await items.json();
assert.ok(Array.isArray(body.items), "D1 API must return an items array");
assert.ok(body.items.some((item) => item.id === 1 && item.title === "Uzi and D1 are connected"),
  "D1 API must return the seed record from 0001_items.sql");
console.log("Cloudflare demo smoke tests passed: frontend, Worker health and D1 query");

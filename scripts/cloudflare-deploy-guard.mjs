import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";

// Reusable workflows check out the caller application. Resolve its installed
// JSONC parser even when this pinned helper lives in the runner temp directory.
const ts = createRequire(resolve("package.json"))("typescript");
const {
  WRANGLER_CONFIG: filename, DATABASE_BINDING: binding,
  EXPECTED_WORKER_NAME: worker, EXPECTED_DATABASE_ID: databaseId, SMOKE_URL: smokeUrl,
} = process.env;
if (!/^[A-Za-z0-9._-]+\.jsonc?$/.test(filename || "")) throw Error("Invalid Wrangler config filename");
if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(binding || "")) throw Error("Invalid D1 binding");
if (!/^[a-z0-9][a-z0-9-]*$/.test(worker || "")) throw Error("Missing/invalid CLOUDFLARE_WORKER_NAME environment variable");
if (!/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(databaseId || "")) throw Error("Missing/invalid CLOUDFLARE_D1_DATABASE_ID environment variable");
const url = new URL(smokeUrl || "http://invalid.invalid/");
if (url.protocol !== "https:" || url.username || url.password || !url.hostname || url.hash) throw Error("CLOUDFLARE_SMOKE_URL must be an HTTPS endpoint without credentials or fragments");
if (url.hostname.endsWith(".workers.dev") && !url.hostname.startsWith(worker + ".")) {
  throw Error("CLOUDFLARE_SMOKE_URL must target the configured Worker on workers.dev");
}
const parsed = ts.parseConfigFileTextToJson(filename, readFileSync(filename, "utf8"));
if (parsed.error) throw Error(ts.flattenDiagnosticMessageText(parsed.error.messageText, "\n"));
const config = parsed.config;
if (config.name !== worker) throw Error("Worker name does not match protected environment");
const databases = (config.d1_databases ?? []).filter(db => db.binding === binding);
if (databases.length !== 1 || databases[0].database_id !== databaseId) {
  throw Error("D1 binding/database_id does not match protected environment");
}
console.log("Worker and D1 match protected environment; remote migration authorized");

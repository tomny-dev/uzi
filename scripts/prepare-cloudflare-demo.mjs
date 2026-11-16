import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const workerName = process.env.DEMO_WORKER_NAME ?? "";
const databaseName = process.env.DEMO_D1_DATABASE_NAME ?? "";
const databaseId = process.env.DEMO_D1_DATABASE_ID ?? "";

if (!/^uzi-demo-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(workerName)) {
  throw new Error("DEMO_WORKER_NAME must start with 'uzi-demo-' and contain only lowercase letters, digits, and hyphens");
}
if (!/^uzi-demo-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(databaseName)) {
  throw new Error("DEMO_D1_DATABASE_NAME must start with 'uzi-demo-' and contain only lowercase letters, digits, and hyphens");
}
if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(databaseId)) {
  throw new Error("DEMO_D1_DATABASE_ID must be a valid UUID");
}

const file = resolve("examples/cloudflare-app/wrangler.jsonc");
const config = JSON.parse(readFileSync(file, "utf8"));
if (config.name !== "replace-with-your-worker-name" ||
    config.d1_databases?.length !== 1 ||
    config.d1_databases[0].binding !== "DB" ||
    config.d1_databases[0].database_id !== "REPLACE_WITH_REAL_D1_DATABASE_ID") {
  throw new Error("Unexpected demo configuration; refusing to override non-template resources");
}
config.name = workerName;
config.d1_databases[0].database_name = databaseName;
config.d1_databases[0].database_id = databaseId;
writeFileSync(file, JSON.stringify(config, null, 2) + "\n");
console.log("Prepared isolated Uzi demo Worker configuration");

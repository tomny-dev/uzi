import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const workflow = readFileSync(".github/workflows/cloudflare-deploy.yml", "utf8");
const opener = "node --input-type=module <<'NODE'\n";
const start = workflow.indexOf(opener);
if (start < 0) throw Error("Deployment resource check is missing");

const scriptStart = start + opener.length;
const scriptEnd = workflow.indexOf("\n          NODE", scriptStart);
if (scriptEnd < 0) throw Error("Deployment resource check is unterminated");

const validator = workflow
  .slice(scriptStart, scriptEnd)
  .split("\n")
  .map((line) => line.replace(/^ {10}/, ""))
  .join("\n");

const fixtureDir = mkdtempSync(join(process.cwd(), ".cloudflare-gate-test-"));
const filename = "wrangler.fixture.jsonc";
const databaseId = "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee";

try {
  writeFileSync(
    join(fixtureDir, filename),
    `{
      // Wrangler accepts JSONC comments and trailing commas.
      "name": "uzi-demo-ci",
      "d1_databases": [{
        "binding": "DB",
        "database_name": "uzi-demo-ci",
        "database_id": "${databaseId}",
      }],
    }`,
  );

  const defaults = {
    WRANGLER_CONFIG: filename,
    DATABASE_BINDING: "DB",
    EXPECTED_WORKER_NAME: "uzi-demo-ci",
    EXPECTED_DATABASE_ID: databaseId,
    SMOKE_URL: "https://uzi-demo-ci.example.workers.dev/api/health",
  };

  function validate(overrides = {}) {
    return spawnSync(process.execPath, ["--input-type=module"], {
      cwd: fixtureDir,
      input: validator,
      env: { ...process.env, ...defaults, ...overrides },
      encoding: "utf8",
    });
  }

  const valid = validate();
  assert.equal(valid.status, 0, valid.stderr || valid.stdout);

  for (const [label, changes] of [
    ["wrong Worker", { EXPECTED_WORKER_NAME: "other-worker" }],
    ["wrong D1", { EXPECTED_DATABASE_ID: "bbbbbbbb-bbbb-4ccc-8ddd-eeeeeeeeeeee" }],
    ["missing HTTPS", { SMOKE_URL: "http://uzi-demo-ci.example.workers.dev/api/health" }],
    ["unrelated Worker", { SMOKE_URL: "https://other-worker.example.workers.dev/api/health" }],
    ["missing DB", { DATABASE_BINDING: "OTHER_DB" }],
  ]) {
    const result = validate(changes);
    assert.notEqual(result.status, 0, `${label}: should reject before remote D1 writes`);
  }
  console.log("Protected Cloudflare deployment resource guard passed 6 cases");
} finally {
  rmSync(fixtureDir, { recursive: true, force: true });
}

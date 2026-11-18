import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { copyFileSync, mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const fixtureRoot = mkdtempSync(join(tmpdir(), "cloudflare-gate-test-"));
const fixtureDir = join(fixtureRoot, "caller-app");
const helperDir = join(fixtureRoot, "uzi-helper");
const validator = join(helperDir, "cloudflare-deploy-guard.mjs");
const filename = "wrangler.fixture.jsonc";
const databaseId = "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee";

try {
  mkdirSync(join(fixtureDir, "node_modules"), { recursive: true });
  mkdirSync(helperDir);
  writeFileSync(join(fixtureDir, "package.json"), "{}");
  // Only the caller has dependencies; the isolated helper checkout has none.
  const require = createRequire(import.meta.url);
  symlinkSync(join(require.resolve("typescript/package.json"), ".."), join(fixtureDir, "node_modules/typescript"), "dir");
  copyFileSync(fileURLToPath(new URL("./cloudflare-deploy-guard.mjs", import.meta.url)), validator);
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
    return spawnSync(process.execPath, [validator], {
      cwd: fixtureDir,
      env: { ...process.env, ...defaults, ...overrides },
      encoding: "utf8",
    });
  }

  const valid = validate();
  assert.equal(valid.status, 0, valid.stderr || valid.stdout);
  assert.equal(validate({ SMOKE_URL: "https://app.example.com/api/health" }).status, 0);

  for (const [label, changes] of [
    ["wrong Worker", { EXPECTED_WORKER_NAME: "other-worker" }],
    ["wrong D1", { EXPECTED_DATABASE_ID: "bbbbbbbb-bbbb-4ccc-8ddd-eeeeeeeeeeee" }],
    ["missing HTTPS", { SMOKE_URL: "http://uzi-demo-ci.example.workers.dev/api/health" }],
    ["unrelated Worker", { SMOKE_URL: "https://other-worker.example.workers.dev/api/health" }],
    ["missing DB", { DATABASE_BINDING: "OTHER_DB" }],
    ["invalid filename", { WRANGLER_CONFIG: "../wrangler.jsonc" }],
    ["invalid binding", { DATABASE_BINDING: "DB; echo bad" }],
    ["missing Worker", { EXPECTED_WORKER_NAME: "" }],
    ["invalid database ID", { EXPECTED_DATABASE_ID: "not-a-uuid" }],
    ["URL credentials", { SMOKE_URL: "https://user:password@app.example.com/health" }],
    ["URL fragment", { SMOKE_URL: "https://app.example.com/health#fragment" }],
  ]) {
    const result = validate(changes);
    assert.notEqual(result.status, 0, `${label}: should reject before remote D1 writes`);
  }
  writeFileSync(join(fixtureDir, filename), `{"name":"uzi-demo-ci","d1_databases":[{"binding":"DB","database_id":"${databaseId}"},{"binding":"DB","database_id":"${databaseId}"}]}`);
  assert.notEqual(validate().status, 0, "duplicate binding should reject");
  writeFileSync(join(fixtureDir, filename), "{ invalid JSONC");
  assert.notEqual(validate().status, 0, "malformed JSONC should reject");
  console.log("Protected Cloudflare deployment resource guard passed 15 cases");
} finally {
  rmSync(fixtureRoot, { recursive: true, force: true });
}

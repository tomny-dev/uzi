import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { chmodSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";

const workflow = name => parse(readFileSync(new URL(`../.github/workflows/cloudflare-${name}.yml`, import.meta.url), "utf8"));
const quality = workflow("quality");
const deploy = workflow("deploy");
const verify = deploy.jobs.verify;
assert.equal(verify.uses, "./.github/workflows/cloudflare-quality.yml");
assert.equal(verify.steps, undefined, "deployment must delegate quality policy");
assert.equal(verify.secrets, undefined, "verification must not inherit deployment secrets");
assert.equal(verify.environment, undefined);
assert.equal(verify.if.replace(/\s+/g, " ").trim(), "(github.event_name == 'push' || github.event_name == 'workflow_dispatch') && github.ref == inputs.deploy_ref");
assert.equal(verify.with.verify_d1_migrations, true);
for (const input of ["app_directory", "pnpm_version", "database_binding", "wrangler_config", "wrangler_version"]) {
  assert.equal(verify.with[input], `\${{ inputs.${input} }}`);
  assert.ok(quality.on.workflow_call.inputs[input]);
}
assert.equal(deploy.jobs.deploy.needs, "verify", "failed or skipped verification must block deployment");
assert.equal(deploy.jobs.deploy.if, undefined, "do not override needs success semantics");
assert.equal(deploy.jobs.deploy.environment, "${{ inputs.environment_name }}");
assert.equal(deploy.concurrency["cancel-in-progress"], false);
assert.equal(quality.jobs.quality.environment, undefined);
assert.equal(quality.on.workflow_call.inputs.verify_d1_migrations.default, false);
const steps = quality.jobs.quality.steps;
assert.equal(steps[0].uses, "actions/checkout@v4");
assert.equal(steps[0].with?.repository, undefined, "quality checks the caller checkout");
assert.ok(!JSON.stringify(quality.jobs.quality).includes("secrets."));
const application = steps.find(step => step.name === "Validate application");
const migrations = steps.find(step => step.name === "Verify D1 migrations against fresh local database");
assert.equal(migrations.if, "inputs.verify_d1_migrations");
assert.ok(steps.indexOf(application) < steps.indexOf(migrations));

const deploySteps = deploy.jobs.deploy.steps;
const guardIndex = deploySteps.findIndex(step => step.name === "Refuse mismatched environment resources before remote writes");
const remoteIndex = deploySteps.findIndex(step => step.name === "Migrate remote D1, then deploy Worker");
assert.ok(guardIndex >= 0 && remoteIndex > guardIndex);
const guard = deploySteps[guardIndex];
const helper = readFileSync(new URL("./cloudflare-deploy-guard.mjs", import.meta.url));
const blob = createHash("sha1").update(`blob ${helper.length}\0`).update(helper).digest("hex");
assert.match(guard.run, new RegExp(`guard_blob=${blob}\\b`), "update the immutable helper blob pin when changing the guard");
assert.ok(guard.run.includes('git hash-object --no-filters "$guard_script"'));
assert.ok(guard.run.includes('node "$guard_script"'));

const root = mkdtempSync(join(tmpdir(), "cloudflare-workflows-"));
try {
  const bin = join(root, "bin");
  const app = join(root, "caller app");
  const log = join(root, "commands.jsonl");
  mkdirSync(bin);
  mkdirSync(app);
  writeFileSync(join(app, "wrangler.jsonc"), "{}");
  const pnpm = join(bin, "pnpm");
  writeFileSync(pnpm, `#!${process.execPath}
import { appendFileSync } from "node:fs";
const args = process.argv.slice(2);
appendFileSync(process.env.COMMAND_LOG, JSON.stringify(args) + "\\n");
if (args.at(-1) === process.env.FAIL_SCRIPT) process.exit(1);
`);
  chmodSync(pnpm, 0o755);
  const defaults = {
    APP_DIRECTORY: app,
    DATABASE_BINDING: "DB",
    WRANGLER_CONFIG: "wrangler.jsonc",
    WRANGLER_VERSION: "4.163.0",
    RUNNER_TEMP: root,
    COMMAND_LOG: log,
    PATH: `${bin}:${process.env.PATH}`,
  };
  const run = (script, overrides = {}) => spawnSync("bash", ["--noprofile", "--norc", "-c", script], {
    env: { ...process.env, ...defaults, ...overrides }, encoding: "utf8",
  });
  const commands = () => readFileSync(log, "utf8").trim().split("\n").filter(Boolean).map(line => JSON.parse(line));
  const scripts = (names) => writeFileSync(join(app, "package.json"), JSON.stringify({ scripts: Object.fromEntries(names.map(name => [name, "fixture"])) }));
  const reset = () => writeFileSync(log, "");

  // Execute the canonical quality steps both standalone and through the deploy
  // call's D1-enabled inputs. Mock pnpm records commands; no Cloudflare writes.
  for (const withD1 of [quality.on.workflow_call.inputs.verify_d1_migrations.default, verify.with.verify_d1_migrations]) {
    scripts(["lint", "format:check", "typecheck", "test", "build"]);
    reset();
    let result = run(application.run);
    assert.equal(result.status, 0, result.stderr);
    if (withD1) {
      result = run(migrations.run);
      assert.equal(result.status, 0, result.stderr);
    }
    const recorded = commands();
    assert.deepEqual(recorded.slice(0, 5).map(args => args.at(-1)), ["lint", "format:check", "typecheck", "test", "build"]);
    assert.equal(recorded.length, withD1 ? 6 : 5);
    if (withD1) assert.deepEqual(recorded[5], ["dlx", "wrangler@4.163.0", "d1", "migrations", "apply", "DB", "--local", "--config", join(app, "wrangler.jsonc"), "--persist-to", join(root, "cloudflare-quality-d1")]);
  }
  scripts(["typecheck", "test", "build"]);
  reset();
  assert.equal(run(application.run).status, 0);
  assert.deepEqual(commands().map(args => args.at(-1)), ["typecheck", "test", "build"]);
  for (const missing of ["typecheck", "test", "build"]) {
    scripts(["typecheck", "test", "build"].filter(name => name !== missing));
    reset();
    assert.notEqual(run(application.run).status, 0);
    assert.deepEqual(commands(), [], "missing required scripts fail before any checks run");
  }
  scripts(["lint", "format:check", "typecheck", "test", "build"]);
  for (const failure of ["lint", "format:check", "typecheck", "test", "build"]) {
    reset();
    assert.notEqual(run(application.run, { FAIL_SCRIPT: failure }).status, 0);
    assert.equal(commands().at(-1).at(-1), failure, "failed checks stop the gate immediately");
  }
  for (const invalid of [{ DATABASE_BINDING: "DB;exit" }, { WRANGLER_CONFIG: "../wrangler.jsonc" }, { WRANGLER_VERSION: "latest" }, { WRANGLER_CONFIG: "missing.jsonc" }]) {
    reset();
    assert.notEqual(run(migrations.run, invalid).status, 0);
    assert.deepEqual(commands(), [], "invalid D1 arguments fail before Wrangler");
  }
  // Execute the actual deployment step with only HTTP replaced by a fixture.
  // This covers the content-addressed download and caller dependency boundary.
  const curl = join(bin, "curl");
  writeFileSync(curl, `#!${process.execPath}
import { readFileSync } from "node:fs";
if (process.env.FAIL_DOWNLOAD) process.exit(22);
process.stdout.write(process.env.TAMPER_DOWNLOAD ? "throw Error('untrusted');" : readFileSync(process.env.GUARD_FIXTURE));
`);
  chmodSync(curl, 0o755);
  mkdirSync(join(app, "node_modules"));
  const require = createRequire(import.meta.url);
  symlinkSync(join(require.resolve("typescript/package.json"), ".."), join(app, "node_modules/typescript"), "dir");
  const databaseId = "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee";
  writeFileSync(join(app, "wrangler.jsonc"), JSON.stringify({ name: "fixture-worker", d1_databases: [{ binding: "DB", database_id: databaseId }] }));
  const guardEnv = {
    GUARD_FIXTURE: fileURLToPath(new URL("./cloudflare-deploy-guard.mjs", import.meta.url)),
    EXPECTED_WORKER_NAME: "fixture-worker",
    EXPECTED_DATABASE_ID: databaseId,
    SMOKE_URL: "https://fixture-worker.example.workers.dev/health",
  };
  const guarded = run(guard.run, guardEnv);
  assert.equal(guarded.status, 0, guarded.stderr);
  for (const invalid of [{ FAIL_DOWNLOAD: "1" }, { TAMPER_DOWNLOAD: "1" }, { EXPECTED_WORKER_NAME: "wrong-worker" }]) {
    assert.notEqual(run(guard.run, { ...guardEnv, ...invalid }).status, 0, "download or guard failure must block remote writes");
  }
  console.log("Cloudflare workflow delegation, fail-closed boundaries, and quality fixture checks passed");
} finally {
  rmSync(root, { recursive: true, force: true });
}

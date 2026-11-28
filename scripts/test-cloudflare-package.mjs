import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

// Install the built tarball outside the workspace, rather than importing dist directly.
const packageDirectory = fileURLToPath(new URL("../packages/cloudflare/", import.meta.url));
const require = createRequire(join(packageDirectory, "package.json"));
const tsc = require.resolve("typescript/lib/tsc.js");
const consumer = mkdtempSync(join(tmpdir(), "uzi-cloudflare-package-"));

try {
  const [packed] = JSON.parse(execFileSync("npm", ["pack", "--ignore-scripts", "--json", "--pack-destination", consumer], {
    cwd: packageDirectory,
    encoding: "utf8",
  }));
  writeFileSync(join(consumer, "package.json"), JSON.stringify({ private: true, type: "module" }));
  execFileSync("npm", ["install", "--offline", "--ignore-scripts", "--no-audit", "--no-fund", "--package-lock=false", join(consumer, packed.filename)], {
    cwd: consumer,
    stdio: "inherit",
  });

  const fixture = join(consumer, "consumer.mts");
  writeFileSync(fixture, `
import { apiError, requireD1, MissingBindingError, type ApiErrorBody, type D1DatabaseLike } from "@tomny-dev/cloudflare";

const db: D1DatabaseLike = { prepare() { throw new Error("not called"); } };
if (requireD1({ DB: db }, "DB") !== db) throw new Error("D1 binding mismatch");
try {
  requireD1({ DB: null }, "DB");
  throw new Error("Expected invalid binding to throw");
} catch (error) {
  if (!(error instanceof MissingBindingError)) throw error;
}
const response = apiError(404, "NOT_FOUND", "Item not found");
const body: ApiErrorBody = await response.json();
if (response.status !== 404 || response.headers.get("cache-control") !== "no-store" || body.error.code !== "NOT_FOUND" || body.error.message !== "Item not found") {
  throw new Error("Unexpected API error response");
}
`);
  execFileSync(process.execPath, [tsc, "--noEmit", "--strict", "--target", "ES2022", "--lib", "ES2022,DOM", "--module", "NodeNext", "--moduleResolution", "NodeNext", fixture], {
    cwd: consumer,
    stdio: "inherit",
  });
  execFileSync(process.execPath, ["--experimental-strip-types", fixture], { cwd: consumer, stdio: "inherit" });
  console.log("Packed Cloudflare consumer passed type and runtime checks.");
} finally {
  rmSync(consumer, { recursive: true, force: true });
}

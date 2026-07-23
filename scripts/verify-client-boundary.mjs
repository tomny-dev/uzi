import { createRequire } from "node:module";
import { readFile } from "node:fs/promises";

const repositoryRoot = new URL("../", import.meta.url);
const clientEntries = ["dist/index.js", "dist/index.cjs"];
const serverSafeEntries = [
  "dist/server.js",
  "dist/server.cjs",
  "dist/utils.js",
  "dist/utils.cjs",
];
const clientDirective = /^["']use client["'];/;

for (const relativePath of clientEntries) {
  const source = await readFile(new URL(relativePath, repositoryRoot), "utf8");

  if (!clientDirective.test(source.trimStart())) {
    throw new Error(`${relativePath} must begin with a "use client" directive`);
  }
}

for (const relativePath of serverSafeEntries) {
  const source = await readFile(new URL(relativePath, repositoryRoot), "utf8");

  if (clientDirective.test(source.trimStart())) {
    throw new Error(`${relativePath} must remain server-safe`);
  }
}

const require = createRequire(import.meta.url);
const esmUtils = await import("@tomny-dev/uzi/utils");
const cjsUtils = require("@tomny-dev/uzi/utils");

for (const [format, utils] of [["ESM", esmUtils], ["CommonJS", cjsUtils]]) {
  if (utils.cx("server", false, "safe") !== "server safe") {
    throw new Error(`${format} @tomny-dev/uzi/utils export is invalid`);
  }
}

console.log("Verified client and server package boundaries.");

import { readFile } from "node:fs/promises";

const repositoryRoot = new URL("../", import.meta.url);
const clientEntries = ["dist/index.js", "dist/index.cjs"];
const serverEntries = ["dist/server.js", "dist/server.cjs"];
const clientDirective = /^["']use client["'];/;

for (const relativePath of clientEntries) {
  const source = await readFile(new URL(relativePath, repositoryRoot), "utf8");

  if (!clientDirective.test(source.trimStart())) {
    throw new Error(`${relativePath} must begin with a "use client" directive`);
  }
}

for (const relativePath of serverEntries) {
  const source = await readFile(new URL(relativePath, repositoryRoot), "utf8");

  if (clientDirective.test(source.trimStart())) {
    throw new Error(`${relativePath} must remain server-safe`);
  }
}

console.log("Verified client and server package boundaries.");

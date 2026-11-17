import assert from "node:assert/strict";
import { test } from "node:test";
import worker from "../worker/index.ts";

const url = (path) => new Request("https://example.test" + path);
const assets = { fetch: async () => new Response("frontend", { status: 200 }) };
const withDatabase = (database) => ({ ASSETS: assets, DB: database });

test("health endpoint returns an explicit success response", async () => {
  const response = await worker.fetch(url("/api/health"), { ASSETS: assets });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true });
});

test("items endpoint returns D1 results, without caching", async () => {
  let statementSql;
  const db = {
    prepare(sql) {
      statementSql = sql;
      return { all: async () => ({ success: true, results: [{ id: 1, title: "Item" }] }) };
    },
  };
  const response = await worker.fetch(url("/api/items"), withDatabase(db));
  assert.equal(response.status, 200);
  assert.match(statementSql, /SELECT id, title FROM items/);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.deepEqual(await response.json(), { items: [{ id: 1, title: "Item" }] });
});

test("unavailable database returns a sanitized 503 instead of an exception", async () => {
  const response = await worker.fetch(url("/api/items"), { ASSETS: assets });
  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), {
    error: { code: "DATABASE_UNAVAILABLE", message: "Database unavailable" },
  });
});

test("unsuccessful D1 query returns a sanitized 503", async () => {
  const db = { prepare: () => ({ all: async () => ({ success: false, results: [] }) }) };
  const response = await worker.fetch(url("/api/items"), withDatabase(db));
  assert.equal(response.status, 503);
  assert.equal((await response.json()).error.code, "DATABASE_UNAVAILABLE");
});

test("unknown API routes do not fall through to static assets", async () => {
  const response = await worker.fetch(url("/api/not-found"), { ASSETS: assets });
  assert.equal(response.status, 404);
  assert.equal((await response.json()).error.code, "NOT_FOUND");
});

test("non-API routes are served by the configured static asset binding", async () => {
  const response = await worker.fetch(url("/hello"), { ASSETS: assets });
  assert.equal(response.status, 200);
  assert.equal(await response.text(), "frontend");
});

import { describe, expect, it } from "vitest";
import { apiError, MissingBindingError, requireD1 } from "./index.js";

describe("requireD1", () => {
  const db = { prepare: () => ({}) };
  it("returns the app-provided binding", () => {
    expect(requireD1({ DB: db }, "DB")).toBe(db);
  });
  it("rejects missing or invalid bindings", () => {
    expect(() => requireD1({ DB: undefined }, "DB")).toThrow(MissingBindingError);
    expect(() => requireD1({ DB: {} }, "DB")).toThrow("Missing or invalid D1 binding: DB");
  });
});

describe("apiError", () => {
  it("returns a structured, noncacheable JSON response", async () => {
    const response = apiError(404, "NOT_FOUND", "Not found");
    expect(response.status).toBe(404);
    expect(response.headers.get("content-type")).toBe("application/json; charset=utf-8");
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.json()).toEqual({ error: { code: "NOT_FOUND", message: "Not found" } });
  });
  it("rejects successful statuses and empty errors", () => {
    expect(() => apiError(200, "OK", "No")).toThrow(RangeError);
    expect(() => apiError(400, "", "Bad request")).toThrow(TypeError);
  });
});

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const themeCss = readFileSync(fileURLToPath(new URL("./theme.css", import.meta.url)), "utf8");
const surfaceCss = readFileSync(
  fileURLToPath(new URL("../components/surface/surface.module.css", import.meta.url)),
  "utf8",
);

describe("semantic theme token contract", () => {
  it("exposes named aliases for surface and accent semantics", () => {
    expect(themeCss).toContain("--uzi-surface-base: var(--uzi-surface-1);");
    expect(themeCss).toContain("--uzi-surface-subtle: var(--uzi-surface-2);");
    expect(themeCss).toContain("--uzi-accent-primary: var(--primary);");
    expect(themeCss).toContain("--uzi-text-on-accent: var(--primary-foreground);");
  });

  it("keeps Surface aligned with the named surface aliases", () => {
    expect(surfaceCss).toContain("var(--uzi-surface-base, var(--uzi-surface-1, var(--panel)))");
    expect(surfaceCss).toContain("var(--uzi-surface-subtle, var(--uzi-surface-2, var(--muted)))");
  });
});

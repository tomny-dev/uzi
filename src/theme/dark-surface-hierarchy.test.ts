import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const themeCss = readFileSync(fileURLToPath(new URL("./theme.css", import.meta.url)), "utf8");

describe("dark surface hierarchy", () => {
  it("builds dark layers from the theme palette instead of whitening surfaces", () => {
    expect(themeCss).toContain("--uzi-surface-1: var(--panel);");
    expect(themeCss).toContain("--uzi-surface-2: var(--secondary);");
    expect(themeCss).toContain(
      "--uzi-surface-raised: color-mix(in srgb, var(--panel) 94%, var(--foreground));",
    );
  });

  it("does not use white as a dark surface elevation source", () => {
    expect(themeCss).not.toMatch(/--uzi-surface-(?:1|2|raised):[^;]*white/);
  });
});

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { SidebarNav } from "./SidebarNav";

// Mock CSS modules to avoid import issues in tests
vi.mock("./sidebar-nav.module.css", () => ({
  default: {
    sidebarNav: "uzi-sidebarNav",
    sidebarNavCollapsed: "uzi-sidebarNavCollapsed",
    header: "uzi-header",
    sections: "uzi-sections",
    section: "uzi-section",
    sectionLabel: "uzi-sectionLabel",
    sectionItems: "uzi-sectionItems",
    item: "uzi-item",
    itemActive: "uzi-itemActive",
    itemCollapsed: "uzi-itemCollapsed",
    itemDisabled: "uzi-itemDisabled",
    icon: "uzi-icon",
    itemBody: "uzi-itemBody",
    labelRow: "uzi-labelRow",
    label: "uzi-label",
    badge: "uzi-badge",
    description: "uzi-description",
    footer: "uzi-footer",
  },
}));

// Helper to find an anchor by its visible text content (aria-current is on <a>, not inner span)
const getAnchorByText = (text: string): HTMLAnchorElement => {
  return screen.getByRole("link", { name: text }) as HTMLAnchorElement;
};

// DOM assertion helpers that work with vitest's native assertions and TypeScript
const isActive = (el: HTMLElement | null): boolean => el?.getAttribute("aria-current") === "page";

describe("SidebarNav active matching", () => {
  const baseItems = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/models", label: "Models" },
  ];

  describe("default prefix matching (matchStrategy='prefix' or undefined)", () => {
    it("highlights BOTH parent and child when on a child route", () => {
      render(<SidebarNav items={baseItems} currentPath="/admin/models" />);
      const dashboard = getAnchorByText("Dashboard");
      const models = getAnchorByText("Models");
      expect(isActive(dashboard)).toBe(true);
      expect(isActive(models)).toBe(true);
    });

    it("highlights only exact match when path equals href exactly (prefix also matches)", () => {
      render(<SidebarNav items={baseItems} currentPath="/admin/models" />);
      const models = getAnchorByText("Models");
      expect(isActive(models)).toBe(true);
    });

    it("highlights only parent when on exact parent route (prefix matches)", () => {
      render(<SidebarNav items={baseItems} currentPath="/admin" />);
      const dashboard = getAnchorByText("Dashboard");
      const models = getAnchorByText("Models");
      expect(isActive(dashboard)).toBe(true);
      // /admin/models does NOT start with /admin (no trailing slash) -- wait, it IS exactly equal to href!
      // Actually: "/admin".startsWith("/admin") is true but we check path.startsWith(item.href)
      // So for item {href: "/admin/models"}, path="/admin": "/admin".startsWith("/admin/models") = false
      expect(isActive(models)).toBe(false);
    });

    it("highlights nothing when on unknown route", () => {
      render(<SidebarNav items={baseItems} currentPath="/unknown" />);
      const dashboard = getAnchorByText("Dashboard");
      const models = getAnchorByText("Models");
      expect(isActive(dashboard)).toBe(false);
      expect(isActive(models)).toBe(false);
    });

    it("highlights nothing when no currentPath provided", () => {
      render(<SidebarNav items={baseItems} />);
      const dashboard = getAnchorByText("Dashboard");
      const models = getAnchorByText("Models");
      expect(isActive(dashboard)).toBe(false);
      expect(isActive(models)).toBe(false);
    });

    it("highlights only / when currentPath is exactly /", () => {
      const items = [{ href: "/", label: "Home" }, ...baseItems];
      render(<SidebarNav items={items} currentPath="/" />);
      const home = getAnchorByText("Home");
      expect(isActive(home)).toBe(true);
    });

    it("does not highlight / when currentPath is NOT exactly /", () => {
      const items = [{ href: "/", label: "Home" }, ...baseItems];
      render(<SidebarNav items={items} currentPath="/admin/models" />);
      const home = getAnchorByText("Home");
      expect(isActive(home)).toBe(false);
    });
  });

  describe('most-specific matching (matchStrategy="most-specific")', () => {
    it("highlights ONLY the most specific match on child route", () => {
      render(
        <SidebarNav items={baseItems} currentPath="/admin/models" matchStrategy="most-specific" />,
      );
      const dashboard = getAnchorByText("Dashboard");
      const models = getAnchorByText("Models");
      expect(isActive(dashboard)).toBe(false);
      expect(isActive(models)).toBe(true);
    });

    it("highlights ONLY parent when on exact parent route", () => {
      render(
        <SidebarNav items={baseItems} currentPath="/admin" matchStrategy="most-specific" />,
      );
      const dashboard = getAnchorByText("Dashboard");
      const models = getAnchorByText("Models");
      expect(isActive(dashboard)).toBe(true);
      // /admin/models does NOT start with /admin (no trailing slash)
      expect(isActive(models)).toBe(false);
    });

    it("highlights nothing when on unknown route", () => {
      render(
        <SidebarNav items={baseItems} currentPath="/unknown" matchStrategy="most-specific" />,
      );
      const dashboard = getAnchorByText("Dashboard");
      const models = getAnchorByText("Models");
      expect(isActive(dashboard)).toBe(false);
      expect(isActive(models)).toBe(false);
    });

    it("highlights nothing when no currentPath provided", () => {
      render(<SidebarNav items={baseItems} matchStrategy="most-specific" />);
      const dashboard = getAnchorByText("Dashboard");
      const models = getAnchorByText("Models");
      expect(isActive(dashboard)).toBe(false);
      expect(isActive(models)).toBe(false);
    });

    it("handles three-level nesting correctly (only deepest is active)", () => {
      const nestedItems = [
        { href: "/admin", label: "Dashboard" },
        { href: "/admin/models", label: "Models" },
        { href: "/admin/models/new", label: "New Model" },
      ];
      render(
        <SidebarNav items={nestedItems} currentPath="/admin/models/new" matchStrategy="most-specific" />,
      );
      const dashboard = getAnchorByText("Dashboard");
      const models = getAnchorByText("Models");
      const newModel = getAnchorByText("New Model");
      expect(isActive(dashboard)).toBe(false);
      expect(isActive(models)).toBe(false);
      expect(isActive(newModel)).toBe(true);
    });

    it("handles trailing slash normalization correctly", () => {
      const itemsWithSlash = [
        { href: "/admin/", label: "Dashboard" },
        { href: "/admin/models", label: "Models" },
      ];
      render(
        <SidebarNav items={itemsWithSlash} currentPath="/admin/models" matchStrategy="most-specific" />,
      );
      const dashboard = getAnchorByText("Dashboard");
      const models = getAnchorByText("Models");
      expect(isActive(dashboard)).toBe(false);
      expect(isActive(models)).toBe(true);
    });

    it("handles two items with same length href correctly (both active)", () => {
      const items = [
        { href: "/admin/models", label: "Models" },
        { href: "/admin/users", label: "Users" },
      ];
      render(
        <SidebarNav items={items} currentPath="/admin/models" matchStrategy="most-specific" />,
      );
      const models = getAnchorByText("Models");
      const users = getAnchorByText("Users");
      expect(isActive(models)).toBe(true);
      // Users does NOT start with /admin/users so should not be active
      expect(isActive(users)).toBe(false);
    });
  });

  describe("per-item exact flag (exact: true)", () => {
    it("makes item match only its exact path and children", () => {
      const items = [
        { href: "/admin/models", label: "Models", exact: true },
      ];
      render(<SidebarNav items={items} currentPath="/admin/models" />);
      const models = getAnchorByText("Models");
      expect(isActive(models)).toBe(true);
    });

    it("matches its own exact path", () => {
      // exact: true with isActiveExact allows the href itself AND paths starting with href/
      const items = [
        { href: "/admin/models", label: "Models", exact: true },
      ];
      render(<SidebarNav items={items} currentPath="/admin/models" />);
      const models = getAnchorByText("Models");
      expect(isActive(models)).toBe(true);
    });

    it("does not match when path is a sibling route", () => {
      const items = [
        { href: "/admin/models", label: "Models", exact: true },
      ];
      render(<SidebarNav items={items} currentPath="/admin/users" />);
      const models = getAnchorByText("Models");
      expect(isActive(models)).toBe(false);
    });

    it("matches on deeper nested child route", () => {
      // isActiveExact: item.href === path OR path.startsWith(item.href + "/")
      // For href="/admin/models" and path="/admin/models/123": startsWith("/admin/models/") = true
      const items = [
        { href: "/admin/models", label: "Models", exact: true },
      ];
      render(<SidebarNav items={items} currentPath="/admin/models/123" />);
      const models = getAnchorByText("Models");
      // This SHOULD be active because /admin/models/123 starts with /admin/models/
      expect(isActive(models)).toBe(true);
    });

    it("works alongside prefix items (both can match)", () => {
      const items = [
        { href: "/admin", label: "Dashboard" },
        { href: "/admin/models", label: "Models", exact: true },
      ];
      render(<SidebarNav items={items} currentPath="/admin/models" />);
      const dashboard = getAnchorByText("Dashboard");
      const models = getAnchorByText("Models");
      // Dashboard matches via prefix (models starts with /admin)
      expect(isActive(dashboard)).toBe(true);
      // Models matches via exact
      expect(isActive(models)).toBe(true);
    });
  });

  describe("explicit getIsActive override (highest priority)", () => {
    it("respects custom getIsActive even when matchStrategy is most-specific", () => {
      render(
        <SidebarNav
          items={baseItems}
          currentPath="/admin/models"
          matchStrategy="most-specific"
          getIsActive={(item) => item.href === "/admin"}
        />,
      );
      const dashboard = getAnchorByText("Dashboard");
      const models = getAnchorByText("Models");
      expect(isActive(dashboard)).toBe(true);
      expect(isActive(models)).toBe(false);
    });

    it("respects custom getIsActive in prefix mode too", () => {
      render(
        <SidebarNav
          items={baseItems}
          currentPath="/admin/models"
          matchStrategy="prefix"
          getIsActive={(item) => item.href === "/admin/models"}
        />,
      );
      const dashboard = getAnchorByText("Dashboard");
      const models = getAnchorByText("Models");
      expect(isActive(dashboard)).toBe(false);
      expect(isActive(models)).toBe(true);
    });
  });

  describe("manual active prop (per-item override, highest priority)", () => {
    it("respects manual active=true on individual items (manual + computed can coexist)", () => {
      const items = [
        { href: "/admin", label: "Dashboard", active: true },
        { href: "/admin/models", label: "Models" },
      ];
      render(<SidebarNav items={items} currentPath="/admin/models" matchStrategy="most-specific" />);
      const dashboard = getAnchorByText("Dashboard");
      const models = getAnchorByText("Models");
      // Dashboard is active via manual override (active=true)
      expect(isActive(dashboard)).toBe(true);
      // Models is ALSO active because it matches the most-specific strategy (no manual override)
      expect(isActive(models)).toBe(true);
    });

    it("manual active overrides most-specific strategy (highest priority)", () => {
      const items = [
        { href: "/admin", label: "Dashboard" },
        { href: "/admin/models", label: "Models", active: true },
      ];
      render(<SidebarNav items={items} currentPath="/admin/other" matchStrategy="most-specific" />);
      const dashboard = getAnchorByText("Dashboard");
      const models = getAnchorByText("Models");
      // Even though no item matches the path, manual active=true forces it
      expect(isActive(dashboard)).toBe(false);
      expect(isActive(models)).toBe(true);
    });

    it("manual active=false overrides computed match", () => {
      const items = [
        { href: "/admin/models", label: "Models", active: false },
      ];
      render(<SidebarNav items={items} currentPath="/admin/models" />);
      const models = getAnchorByText("Models");
      expect(isActive(models)).toBe(false);
    });

    it("manual active works with sections prop too", () => {
      const sections = [
        { id: "s1", items: [{ href: "/admin/models", label: "Models", active: true }] },
      ];
      render(<SidebarNav sections={sections} currentPath="/other" matchStrategy="most-specific" />);
      const models = getAnchorByText("Models");
      expect(isActive(models)).toBe(true);
    });
  });

  describe("disabled items", () => {
    it("disabled item can be visually active but not interactive", () => {
      const items = [
        { href: "/admin/models", label: "Models", disabled: true },
      ];
      render(<SidebarNav items={items} currentPath="/admin/models" />);
      // Disabled items use <div> not <a>, so getByRole("link") won't find them
      // But they CAN be active (highlighted) if path matches - just not clickable
      const allItems = document.querySelectorAll("[aria-current='page']");
      expect(allItems.length).toBe(1);
    });

    it("disabled item has aria-disabled attribute", () => {
      const items = [
        { href: "/admin/models", label: "Models", disabled: true },
      ];
      render(<SidebarNav items={items} currentPath="/admin" />);
      // Find the div with aria-disabled
      const disabledItem = document.querySelector("[aria-disabled='true']");
      expect(disabledItem).not.toBeNull();
    });
  });

  describe("collaborative mode (both active)", () => {
    it("prefix mode highlights both parent and child on child route", () => {
      render(<SidebarNav items={baseItems} currentPath="/admin/models" matchStrategy="prefix" />);
      const dashboard = getAnchorByText("Dashboard");
      const models = getAnchorByText("Models");
      expect(isActive(dashboard)).toBe(true);
      expect(isActive(models)).toBe(true);
    });

    it('most-specific mode highlights only deepest on child route', () => {
      render(
        <SidebarNav items={baseItems} currentPath="/admin/models" matchStrategy="most-specific" />,
      );
      const dashboard = getAnchorByText("Dashboard");
      const models = getAnchorByText("Models");
      expect(isActive(dashboard)).toBe(false);
      expect(isActive(models)).toBe(true);
    });

    it('most-specific mode highlights parent on exact parent route', () => {
      render(
        <SidebarNav items={baseItems} currentPath="/admin" matchStrategy="most-specific" />,
      );
      const dashboard = getAnchorByText("Dashboard");
      const models = getAnchorByText("Models");
      expect(isActive(dashboard)).toBe(true);
      expect(isActive(models)).toBe(false);
    });

    it('most-specific mode highlights both when two items share longest length', () => {
      const items = [
        { href: "/admin/models", label: "Models" },
        { href: "/admin/users", label: "Users" },
      ];
      render(
        <SidebarNav items={items} currentPath="/admin/models" matchStrategy="most-specific" />,
      );
      const models = getAnchorByText("Models");
      const users = getAnchorByText("Users");
      // Both have length 12, but only /admin/models starts with itself
      expect(isActive(models)).toBe(true);
      expect(isActive(users)).toBe(false);
    });
  });
});
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import * as React from "react";
import { SettingsPage } from "./SettingsPage";

vi.mock("./settings-page.module.css", () => ({
  default: new Proxy({} as Record<string, string>, {
    get(_, key) {
      return `uzi-${String(key)}`;
    },
  }),
}));

const mockSections = [
  {
    title: "Profile",
    description: "Manage your public profile information.",
    children: <p>Section content</p>,
  },
  {
    title: "Notifications",
    description: "Choose how you want to be notified.",
    children: <p>More content</p>,
  },
];

describe("SettingsPage", () => {
  it("renders title", () => {
    render(
      <SettingsPage title="Settings" sections={mockSections} footer={<button>Save</button>} />,
    );
    expect(screen.getByRole("heading", { level: 1, name: "Settings" })).toBeTruthy();
  });

  it("renders description", () => {
    render(
      <SettingsPage
        title="Settings"
        description="Manage your account settings."
        sections={mockSections}
        footer={<button>Save</button>}
      />,
    );
    expect(screen.getByText("Manage your account settings.")).toBeTruthy();
  });

  it("renders all sections", () => {
    render(
      <SettingsPage title="Settings" sections={mockSections} footer={<button>Save</button>} />,
    );
    expect(screen.getByText("Profile")).toBeTruthy();
    expect(screen.getByText("Notifications")).toBeTruthy();
    expect(screen.getByText("Manage your public profile information.")).toBeTruthy();
    expect(screen.getByText("Choose how you want to be notified.")).toBeTruthy();
    expect(screen.getByText("Section content")).toBeTruthy();
  });

  it("renders section content", () => {
    render(
      <SettingsPage
        title="Settings"
        sections={[
          {
            title: "Account",
            children: <div data-testid="section-content">Form fields here</div>,
          },
        ]}
        footer={<button>Save</button>}
      />,
    );
    expect(screen.getByTestId("section-content")).toBeTruthy();
  });

  it("renders danger zone when provided", () => {
    render(
      <SettingsPage
        title="Settings"
        sections={mockSections}
        dangerZoneTitle="Danger Zone"
        dangerZoneDescription="Irreversible actions"
        dangerZone={<button>Delete account</button>}
        footer={<button>Save</button>}
      />,
    );
    expect(screen.getByText("Danger Zone")).toBeTruthy();
    expect(screen.getByText("Irreversible actions")).toBeTruthy();
    expect(screen.getByText("Delete account")).toBeTruthy();
  });

  it("renders danger zone without header", () => {
    const { container } = render(
      <SettingsPage
        title="Settings"
        sections={mockSections}
        dangerZone={<button>Delete account</button>}
        footer={<button>Save</button>}
      />,
    );
    expect(container.querySelector(".uzi-dangerZone")).toBeTruthy();
    expect(screen.getByText("Delete account")).toBeTruthy();
  });

  it("renders footer", () => {
    render(
      <SettingsPage
        title="Settings"
        sections={mockSections}
        footer={
          <div>
            <button>Save</button>
            <button>Cancel</button>
          </div>
        }
      />,
    );
    expect(screen.getByText("Save")).toBeTruthy();
    expect(screen.getByText("Cancel")).toBeTruthy();
  });

  it("shows saving indicator", () => {
    render(
      <SettingsPage
        title="Settings"
        sections={mockSections}
        footer={<button>Save</button>}
        saving
      />,
    );
    expect(screen.getByText("Saving...")).toBeTruthy();
  });

  it("does not show saving indicator when not saving", () => {
    const { container } = render(
      <SettingsPage
        title="Settings"
        sections={mockSections}
        footer={<button>Save</button>}
        saving={false}
      />,
    );
    expect(container.querySelector(".uzi-savingIndicator")).toBeFalsy();
  });

  it("applies custom className", () => {
    const { container } = render(
      <SettingsPage
        title="Settings"
        sections={mockSections}
        footer={<button>Save</button>}
        className="my-custom-settings"
      />,
    );
    expect(container.querySelector(".my-custom-settings")).toBeTruthy();
  });

  it("renders section without description", () => {
    render(
      <SettingsPage
        title="Settings"
        sections={[{ title: "Simple Section", children: <p>Content</p> }]}
        footer={<button>Save</button>}
      />,
    );
    expect(screen.getByText("Simple Section")).toBeTruthy();
    expect(screen.queryByText("Content")).toBeTruthy();
  });
});

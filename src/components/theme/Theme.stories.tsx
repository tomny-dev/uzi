import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { ThemeProvider, useTheme } from "../../theme/ThemeProvider";
import type { UziTheme, UziAccent } from "../../theme/ThemeProvider";

const UZI_THEMES = ["light", "dark", "system"] as const;
const UZI_ACCENTS = ["blue", "cyan", "violet", "emerald", "amber", "rose"] as const;

function ThemeControls() {
  const { theme, accent, setTheme, setAccent } = useTheme();
  const [manualTheme, setManualTheme] = useState<UziTheme>("light");
  const [manualAccent, setManualAccent] = useState<UziAccent>("blue");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div>
        <h3 style={{ margin: "0 0 0.5rem 0" }}>Current Theme: {theme}</h3>
        <h3 style={{ margin: "0 0 0.5rem 0" }}>Current Accent: {accent}</h3>
        <h3 style={{ margin: "0 0 0.5rem 0" }}>Resolved: {theme === "system" ? (document.documentElement.getAttribute("data-uzi-theme") || "light") : theme}</h3>
      </div>

      <div>
        <h4 style={{ margin: "0 0 0.5rem 0" }}>Theme Selection</h4>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {UZI_THEMES.map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              style={{
                padding: "0.5rem 1rem",
                cursor: "pointer",
                border: theme === t ? "2px solid var(--primary)" : "1px solid var(--border)",
                borderRadius: "6px",
                background: theme === t ? "var(--primary)" : "transparent",
                color: theme === t ? "var(--primary-foreground)" : "var(--foreground)",
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 style={{ margin: "0 0 0.5rem 0" }}>Accent Selection</h4>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {UZI_ACCENTS.map((a) => (
            <button
              key={a}
              onClick={() => setAccent(a)}
              style={{
                padding: "0.5rem 1rem",
                cursor: "pointer",
                border: accent === a ? "2px solid var(--primary)" : "1px solid var(--border)",
                borderRadius: "6px",
                background: accent === a ? "var(--primary)" : "transparent",
                color: accent === a ? "var(--primary-foreground)" : "var(--foreground)",
              }}
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 style={{ margin: "0 0 0.5rem 0" }}>Controlled Theme</h4>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <select
            value={manualTheme}
            onChange={(e) => setManualTheme(e.target.value as UziTheme)}
            style={{ padding: "0.25rem" }}
          >
            {UZI_THEMES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <select
            value={manualAccent}
            onChange={(e) => setManualAccent(e.target.value as UziAccent)}
            style={{ padding: "0.25rem" }}
          >
            {UZI_ACCENTS.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

const meta = {
  title: "Components/Theme",
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <ThemeProvider defaultTheme="light" defaultAccent="blue">
        <Story />
      </ThemeProvider>
    ),
  ],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const LightTheme: Story = {
  render: () => <ThemeControls />,
};

export const DarkTheme: Story = {
  decorators: [
    (Story) => (
      <ThemeProvider defaultTheme="dark" defaultAccent="blue">
        <Story />
      </ThemeProvider>
    ),
  ],
  render: () => <ThemeControls />,
};

export const SystemTheme: Story = {
  decorators: [
    (Story) => (
      <ThemeProvider defaultTheme="system" defaultAccent="blue">
        <Story />
      </ThemeProvider>
    ),
  ],
  render: () => <ThemeControls />,
};

export const AllAccentPalettes: Story = {
  render: () => {
    const accents: UziAccent[] = ["blue", "cyan", "violet", "emerald", "amber", "rose"];
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {accents.map((accent) => {
          const AccentCard = () => {
            const [currentAccent, setCurrentAccent] = useState(accent);
            return (
              <div>
                <h4 style={{ margin: "0 0 0.5rem 0" }}>{accent}</h4>
                <button
                  onClick={() => setCurrentAccent(currentAccent === "blue" ? "violet" : "blue") as UziAccent}
                  style={{
                    padding: "0.5rem 1rem",
                    cursor: "pointer",
                    background: "var(--primary)",
                    color: "var(--primary-foreground)",
                    border: "none",
                    borderRadius: "6px",
                  }}
                >
                  Toggle accent
                </button>
              </div>
            );
          };
          return (
            <div key={accent} style={{ border: "1px solid var(--border)", borderRadius: "8px", padding: "1rem" }}>
              <ThemeProvider defaultAccent={accent}>
                <AccentCard />
              </ThemeProvider>
            </div>
          );
        })}
      </div>
    );
  },
};

export const ControlledVsUncontrolled: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div style={{ border: "1px solid var(--border)", borderRadius: "8px", padding: "1rem" }}>
        <h4 style={{ margin: "0 0 0.5rem 0" }}>Uncontrolled (defaultTheme)</h4>
        <ThemeProvider defaultTheme="dark" defaultAccent="emerald">
          <ThemeControls />
        </ThemeProvider>
      </div>
      <div style={{ border: "1px solid var(--border)", borderRadius: "8px", padding: "1rem" }}>
        <h4 style={{ margin: "0 0 0.5rem 0" }}>Controlled (theme prop)</h4>
        <ThemeProvider theme="light" accent="rose">
          <ThemeControls />
        </ThemeProvider>
      </div>
    </div>
  ),
};

export const FullThemeSwitcher: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div style={{ border: "1px solid var(--border)", borderRadius: "8px", padding: "1rem" }}>
        <h3 style={{ margin: "0 0 1rem 0" }}>Theme Switcher UI</h3>
        <ThemeControls />
      </div>
    </div>
  ),
};

import type { Preview } from "@storybook/react";
import React from "react";
import { ThemeProvider, useTheme, type UziTheme } from "../src/theme/ThemeProvider";

import "../src/theme/theme.css";

function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();
  return (
    <div
      style={{
        minHeight: "400px",
        padding: "2rem",
        background: "var(--uzi-surface-canvas, var(--background))",
        color: "var(--uzi-text-primary, var(--foreground))",
      }}
      data-preview-theme={resolvedTheme}
    >
      {children}
    </div>
  );
}

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [
    (Story, context) => {
      const selectedTheme: UziTheme = context.globals.theme === "dark" ? "dark" : "light";

      return (
        <ThemeProvider theme={selectedTheme} defaultAccent="blue" disableStorage>
          <ThemeWrapper>
            <Story />
          </ThemeWrapper>
        </ThemeProvider>
      );
    },
  ],
  globalTypes: {
    theme: {
      name: "Theme",
      description: "Global theme for components",
      defaultValue: "light",
      toolbar: {
        icon: "circlehollow",
        items: [
          { value: "light", icon: "circlehollow", title: "Light" },
          { value: "dark", icon: "circle", title: "Dark" },
        ],
        title: "Themes",
      },
    },
  },
};

export default preview;

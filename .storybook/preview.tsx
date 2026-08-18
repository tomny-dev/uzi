import type { Preview } from "@storybook/react";
import React from "react";
import { ThemeProvider, useTheme } from "../src/theme/ThemeProvider";
import { ToastProvider } from "../src/components/toast/ToastContext";

import "../src/theme/theme.css";

function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();
  return (
    <div style={{ minHeight: "400px", padding: "2rem", background: resolvedTheme === "dark" ? "#18181b" : "#ffffff" }}>
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
    (Story) => (
      <ThemeProvider defaultTheme="light" defaultAccent="blue">
        <ThemeWrapper>
          <Story />
        </ThemeWrapper>
      </ThemeProvider>
    ),
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


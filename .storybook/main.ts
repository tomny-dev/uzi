import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: [
    "@storybook/addon-essentials",
    "@storybook/addon-links",
    "@storybook/addon-storysource",
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  viteFinal: async (config) => {
    const path = await import("node:path");
    return {
      ...config,
      resolve: {
        ...config.resolve,
        alias: {
          "@tomny-dev/uzi": path.resolve(__dirname, "../src"),
          ...config.resolve?.alias,
        },
      },
    };
  },
};

export default config;

import type { StorybookConfig } from "@storybook/react-vite";
import tailwindcss from "@tailwindcss/vite";

/**
 * Stories live next to components in:
 *  - packages/ui (primitives)
 *  - platform/frontend and products/<name>/frontend (feature components)
 */
const config: StorybookConfig = {
  stories: [
    "../src/**/*.stories.@(ts|tsx)",
    "../../../platform/frontend/src/**/*.stories.@(ts|tsx)",
    "../../../products/*/frontend/src/**/*.stories.@(ts|tsx)",
  ],
  addons: [],
  framework: { name: "@storybook/react-vite", options: {} },
  core: { disableTelemetry: true },
  viteFinal: async (cfg) => {
    cfg.plugins = [...(cfg.plugins ?? []), tailwindcss()];
    return cfg;
  },
};

export default config;

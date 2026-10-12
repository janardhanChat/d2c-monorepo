// @ts-check
import js from "@eslint/js";
import nextPlugin from "@next/eslint-plugin-next";
import nx from "@nx/eslint-plugin";
import prettier from "eslint-config-prettier";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";

/**
 * Architecture rules (enforced in lint + CI):
 *
 *  scope:*  -> WHO owns the code (which product / platform / shared)
 *  type:*   -> WHAT kind of project it is (layering)
 *
 *  - A product may only use its own code + shared packages. Products never import each other.
 *  - Only platform services may use connectors (products go through integrations-api over HTTP).
 *  - Services never import frontend code; frontends never import services or connectors.
 */
const depConstraints = [
  // ---- ownership ----
  { sourceTag: "scope:shared", onlyDependOnLibsWithTags: ["scope:shared"] },
  { sourceTag: "scope:connector", onlyDependOnLibsWithTags: ["scope:shared"] },
  {
    sourceTag: "scope:platform",
    onlyDependOnLibsWithTags: ["scope:platform", "scope:shared", "scope:connector"],
  },
  { sourceTag: "scope:social", onlyDependOnLibsWithTags: ["scope:social", "scope:shared"] },
  { sourceTag: "scope:commerce", onlyDependOnLibsWithTags: ["scope:commerce", "scope:shared"] },
  { sourceTag: "scope:crm", onlyDependOnLibsWithTags: ["scope:crm", "scope:shared"] },
  {
    sourceTag: "scope:fulfillment",
    onlyDependOnLibsWithTags: ["scope:fulfillment", "scope:shared"],
  },
  // The shell app composes every product's frontend.
  {
    sourceTag: "scope:shell",
    onlyDependOnLibsWithTags: [
      "scope:shared",
      "scope:platform",
      "scope:social",
      "scope:commerce",
      "scope:crm",
      "scope:fulfillment",
    ],
  },

  // ---- layering ----
  {
    sourceTag: "type:app",
    onlyDependOnLibsWithTags: ["type:feature", "type:ui", "type:domain", "type:util"],
  },
  {
    sourceTag: "type:feature",
    onlyDependOnLibsWithTags: ["type:feature", "type:ui", "type:domain", "type:util"],
  },
  {
    sourceTag: "type:service",
    onlyDependOnLibsWithTags: ["type:domain", "type:util", "type:connector", "type:data"],
  },
  { sourceTag: "type:connector", onlyDependOnLibsWithTags: ["type:util"] },
  { sourceTag: "type:domain", onlyDependOnLibsWithTags: ["type:domain", "type:util"] },
  { sourceTag: "type:ui", onlyDependOnLibsWithTags: ["type:ui", "type:util"] },
  { sourceTag: "type:util", onlyDependOnLibsWithTags: ["type:util"] },
  { sourceTag: "type:data", onlyDependOnLibsWithTags: [] },
];

export default tseslint.config(
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/.next/**",
      "**/storybook-static/**",
      "**/coverage/**",
      "**/.nx/**",
      "**/.venv/**",
      "**/next-env.d.ts",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx,js,mjs,cjs}"],
    plugins: { "@nx": nx },
    languageOptions: { globals: { ...globals.node } },
    rules: {
      "@nx/enforce-module-boundaries": [
        "error",
        {
          enforceBuildableLibDependency: false,
          allow: [],
          depConstraints,
        },
      ],
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "no-console": ["warn", { allow: ["warn", "error"] }],
      eqeqeq: ["error", "smart"],
    },
  },
  {
    files: ["**/*.tsx"],
    plugins: { "react-hooks": reactHooks },
    languageOptions: { globals: { ...globals.browser } },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
  {
    files: ["apps/web/**/*.{ts,tsx}"],
    plugins: { "@next/next": nextPlugin },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
    },
  },
  {
    files: ["**/*.{spec,test}.{ts,tsx}", "**/*.stories.tsx", "tools/**", "**/*.config.{ts,mjs,js}"],
    rules: { "no-console": "off" },
  },
  prettier,
);

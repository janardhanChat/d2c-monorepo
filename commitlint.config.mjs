/**
 * Conventional commits, scoped to the area of the monorepo you touched.
 *   feat(social): add festival calendar
 *   fix(core-api): reject unknown org ids
 */
export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "scope-enum": [
      2,
      "always",
      [
        "repo",
        "deps",
        "ci",
        "infra",
        "docs",
        "web",
        "core-api",
        "integrations-api",
        "ai-service",
        "platform-frontend",
        "social",
        "commerce",
        "crm",
        "fulfillment",
        "postiz",
        "ui",
        "auth",
        "tenant",
        "service-kit",
        "config",
      ],
    ],
    "scope-empty": [1, "never"],
    "subject-case": [2, "never", ["start-case", "pascal-case", "upper-case"]],
  },
};

/** Runs on staged files only (pre-commit). Full checks run in pre-push + CI. */
export default {
  "*.{ts,tsx,js,mjs,cjs}": ["eslint --fix --no-warn-ignored", "prettier --write"],
  "*.{json,md,yml,yaml,css}": ["prettier --write"],
  "platform/services/ai-service/**/*.py": (files) => {
    const list = files.join(" ");
    return [
      `uv run --directory platform/services/ai-service ruff check --fix ${list}`,
      `uv run --directory platform/services/ai-service ruff format ${list}`,
    ];
  },
};

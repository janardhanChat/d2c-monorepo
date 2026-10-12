#!/usr/bin/env node
// @ts-check
/**
 * Claude Code PostToolUse hook for Edit / Write / MultiEdit.
 * Formats the edited file and runs ESLint on it, feeding problems back to the agent
 * (exit 2 = the agent sees stderr and must fix it). Never blocks on tooling errors.
 */
import { execFileSync } from "node:child_process";
import path from "node:path";

const input = JSON.parse((await new Response(process.stdin).text()) || "{}");
const root = process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd();
const file = input.tool_input?.file_path;
if (!file) process.exit(0);

const rel = path.relative(root, path.resolve(root, file));
const run = (/** @type {string[]} */ args) =>
  execFileSync("pnpm", ["exec", ...args], {
    cwd: root,
    stdio: ["ignore", "pipe", "pipe"],
    encoding: "utf8",
  });

try {
  if (/\.(ts|tsx|js|mjs|cjs|json|md|css|ya?ml)$/.test(rel))
    run(["prettier", "--write", "--log-level=warn", rel]);
} catch {
  /* formatting problems surface in lint-staged / CI */
}

if (/\.(ts|tsx|js|mjs|cjs)$/.test(rel)) {
  try {
    run(["eslint", "--no-warn-ignored", rel]);
  } catch (err) {
    const out = /** @type {{ stdout?: string }} */ (err).stdout ?? "";
    if (out.trim()) {
      process.stderr.write(
        `ESLint found problems in ${rel}. Fix them (do not disable rules):\n${out}`,
      );
      process.exit(2);
    }
  }
}
process.exit(0);

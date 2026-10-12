// @ts-check
/**
 * Single source of truth for what AI agents may not touch or run.
 * Used by the Claude Code hooks (guard-edit / guard-bash) and the CI migration check.
 * Humans change this file; agents are blocked from editing it.
 */
import { existsSync } from "node:fs";
import path from "node:path";

/** Paths agents must never edit (relative to repo root, POSIX). */
const PROTECTED = [
  {
    re: /(^|\/)\.env($|\.(?!example$)[^/]*$)/,
    why: "secret env file (only .env.example may be edited)",
  },
  {
    re: /(^|\/)(pnpm-lock\.yaml|uv\.lock)$/,
    why: "lockfile: change it only via `pnpm add/remove` or `uv add/remove`",
  },
  {
    re: /^(eslint\.config\.mjs|nx\.json|commitlint\.config\.mjs|lint-staged\.config\.mjs)$/,
    why: "repo guardrail config (humans only)",
  },
  { re: /^\.husky\//, why: "git hooks (humans only)" },
  { re: /^\.github\//, why: "CI, CODEOWNERS and repo policy (humans only)" },
  { re: /^\.claude\//, why: "agent settings (humans only)" },
  { re: /^\.cursor\//, why: "agent settings (humans only)" },
  { re: /^tools\/agents\//, why: "agent guard scripts (humans only)" },
  {
    re: /(^|\/)(AGENTS|CLAUDE)\.md$/,
    why: "agent rules (humans only); propose changes in your reply",
  },
  {
    re: /^infra\/(supabase|postiz)\/upstream\//,
    why: "fetched upstream files; use docker-compose.override.yml",
  },
  {
    re: /(^|\/)(node_modules|dist|\.next|storybook-static|\.nx|\.venv|coverage)\//,
    why: "generated output",
  },
];

const MIGRATION = /(^|\/)migrations\/[^/]+\.sql$/;

/**
 * @param {string} file absolute or relative path
 * @param {string} root repo root
 * @returns {string | null} reason it is blocked, or null if allowed
 */
export function checkEditPath(file, root) {
  const abs = path.resolve(root, file);
  const rel = path.relative(root, abs).split(path.sep).join("/");
  if (rel.startsWith("..")) return `outside the repository (${rel})`;
  for (const p of PROTECTED) if (p.re.test(rel)) return `${rel} is protected: ${p.why}`;
  if (MIGRATION.test(rel) && existsSync(abs)) {
    return `${rel} is an existing migration. Migrations are append-only: create the next numbered file instead`;
  }
  return null;
}

/** Shell commands agents must never run. Each entry: pattern + reason. */
const BLOCKED_COMMANDS = [
  { re: /\bgit\s+push\b/, why: "pushing is for humans" },
  { re: /\bgit\s+reset\s+--hard\b/, why: "discards work" },
  { re: /\bgit\s+clean\b[^|;&]*\s-[a-zA-Z]*f/, why: "deletes untracked files" },
  { re: /\bgit\s+rebase\b/, why: "rewrites history" },
  { re: /\bgit\s+commit\b[^|;&]*--amend\b/, why: "rewrites history" },
  { re: /\bgit\s+(branch|tag)\s+(-D|-d|--delete)\b/, why: "deletes refs" },
  { re: /\bgit\s+checkout\s+(--\s+)?\.(\s|$)/, why: "discards all local changes" },
  { re: /--no-verify\b|\bHUSKY=0\b/, why: "bypasses git hooks" },
  {
    re: /\bdocker\s+(compose\s+down\b[^|;&]*\s-v\b|system\s+prune|volume\s+(rm|prune))/,
    why: "destroys data volumes",
  },
  { re: /\b(DROP|TRUNCATE)\s+(TABLE|SCHEMA|DATABASE)\b/i, why: "destructive SQL" },
  {
    re: /\b(curl|wget)\b[^|]*\|\s*(sudo\s+)?(ba|z)?sh\b/,
    why: "pipes a remote script into a shell",
  },
  {
    re: /(^|[\s;&|(])(npm|npx|yarn)\s/,
    why: "this repo uses pnpm (`pnpm`, `pnpm exec`, `pnpm dlx`)",
  },
  { re: /(^|[\s;&|(])pip3?\s+install\b/, why: "use `uv add` in platform/services/ai-service" },
  { re: /\bchmod\s+(-R\s+)?777\b/, why: "unsafe permissions" },
  {
    re: /(^|[\s;&|(])(cat|less|more|head|tail|bat|grep|rg|source|\.)\s[^|;&]*(^|\/|\s)\.env(\.(?!example\b)\w+)?(\s|$)/,
    why: "reads a secret env file",
  },
  { re: /\b(printenv|env)\s*($|[|;&])/, why: "dumps environment variables (may contain secrets)" },
];

const WRITE_OPS =
  /(\bsed\s+-i\b|\btee\b|>{1,2}\s*\S|\bmv\b|\bcp\b|\brm\b|\btruncate\b|\bperl\s+-[a-z]*i)/;

/**
 * @param {string} command
 * @returns {string | null}
 */
export function checkCommand(command) {
  for (const c of BLOCKED_COMMANDS)
    if (c.re.test(command)) return `\`${command}\` is blocked: ${c.why}`;
  const rm = checkRecursiveDelete(command);
  if (rm) return rm;
  // Writing to a protected path through the shell (sed -i, >, tee, mv, cp, rm)
  if (WRITE_OPS.test(command)) {
    for (const p of PROTECTED) {
      const tokens = command.split(/[\s;&|<>"'`]+/).filter(Boolean);
      const hit = tokens.find((t) => p.re.test(t.replace(/^\.\//, "")));
      if (hit) return `\`${command}\` writes to a protected path (${hit}): ${p.why}`;
    }
    const mig = command.split(/[\s;&|<>"'`]+/).find((t) => MIGRATION.test(t));
    if (mig && /\bsed\s+-i\b|\btee\b|>{1,2}|\brm\b|\bmv\b/.test(command)) {
      return `\`${command}\` modifies a migration (${mig}); migrations are append-only`;
    }
  }
  return null;
}

const GENERATED_DIR =
  /(^|\/)(node_modules|dist|\.next|storybook-static|coverage|\.nx|\.turbo|\.pytest_cache|\.ruff_cache|\.mypy_cache|__pycache__)\/?$/;

/**
 * `rm -r` is allowed only when EVERY target is a generated folder (node_modules, dist, .next…).
 * @param {string} command
 * @returns {string | null}
 */
function checkRecursiveDelete(command) {
  for (const segment of command.split(/&&|\|\||[;|\n]/)) {
    const words = segment.trim().split(/\s+/);
    const i = words.findIndex((w) => w === "rm" || w.endsWith("/rm"));
    if (i === -1) continue;
    const args = words.slice(i + 1);
    const flags = args.filter((a) => a.startsWith("-")).join("");
    const recursive = /r|R|--recursive/.test(flags);
    if (!recursive) continue;
    const targets = args.filter((a) => !a.startsWith("-"));
    const bad = targets.filter((t) => !GENERATED_DIR.test(t.replace(/^['"]|['"]$/g, "")));
    if (targets.length === 0 || bad.length > 0) {
      return `\`${command}\` is blocked: recursive delete outside generated folders (${bad.join(", ") || "no target"})`;
    }
  }
  return null;
}

/** True when a human started the agent with an explicit override. */
export const overrideEnabled = () => process.env.AGENT_GUARD_OVERRIDE === "1";

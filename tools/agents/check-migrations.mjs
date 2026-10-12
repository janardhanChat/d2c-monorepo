#!/usr/bin/env node
// @ts-check
/**
 * CI / pre-push check: existing SQL migrations are immutable.
 * Fails if any migration file present on the base branch was modified, renamed or deleted.
 * Usage: node tools/agents/check-migrations.mjs [baseRef]   (default: origin/main, then main)
 */
import { execFileSync } from "node:child_process";

const git = (/** @type {string[]} */ args) =>
  execFileSync("git", args, { encoding: "utf8" }).trim();

const candidates = [process.argv[2], process.env.NX_BASE, "origin/main", "main"].filter(Boolean);
let base = "";
for (const ref of candidates) {
  try {
    git(["rev-parse", "--verify", `${ref}^{commit}`]);
    base = /** @type {string} */ (ref);
    break;
  } catch {
    /* try next */
  }
}
if (!base) {
  console.log("check-migrations: no base ref found, skipping");
  process.exit(0);
}

const mergeBase = git(["merge-base", base, "HEAD"]);
const changed = git([
  "diff",
  "--name-status",
  "--diff-filter=MDR",
  mergeBase,
  "HEAD",
  "--",
  "*migrations/*.sql",
]);

if (changed) {
  console.error(
    "Existing migrations were changed. Migrations are append-only; add a new numbered file instead:\n" +
      changed,
  );
  process.exit(1);
}
console.log(`check-migrations: OK (compared with ${base})`);

#!/usr/bin/env node
// @ts-check
/**
 * Claude Code PreToolUse hook for Edit / Write / MultiEdit / NotebookEdit.
 * Reads the hook JSON from stdin; exits 2 (blocks the tool) with a reason on stderr
 * when the target path is protected. See tools/agents/policy.mjs.
 */
import { checkEditPath, overrideEnabled } from "./policy.mjs";

const input = JSON.parse((await new Response(process.stdin).text()) || "{}");
const root = process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd();
const ti = input.tool_input ?? {};
const file = ti.file_path ?? ti.notebook_path ?? ti.path;

if (!file || overrideEnabled()) process.exit(0);

const reason = checkEditPath(file, root);
if (reason) {
  process.stderr.write(
    `BLOCKED by repo policy (AGENTS.md §3): ${reason}.\n` +
      "Do not try another path or a shell command to get around this. Tell the user what you need to change and why.\n",
  );
  process.exit(2);
}
process.exit(0);

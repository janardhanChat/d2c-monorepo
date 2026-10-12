#!/usr/bin/env node
// @ts-check
/**
 * Claude Code PreToolUse hook for Bash.
 * Blocks destructive git/docker/SQL commands, hook bypasses, npm/yarn/pip, secret reads,
 * and shell writes to protected paths. See tools/agents/policy.mjs.
 */
import { checkCommand, overrideEnabled } from "./policy.mjs";

const input = JSON.parse((await new Response(process.stdin).text()) || "{}");
const command = input.tool_input?.command;

if (typeof command !== "string" || overrideEnabled()) process.exit(0);

const reason = checkCommand(command);
if (reason) {
  process.stderr.write(
    `BLOCKED by repo policy (AGENTS.md §3): ${reason}.\n` +
      "Do not rephrase the command to get around this. Explain to the user what you were trying to do and ask.\n",
  );
  process.exit(2);
}
process.exit(0);

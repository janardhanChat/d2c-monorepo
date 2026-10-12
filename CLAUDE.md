@AGENTS.md

## Claude Code specifics

- The rules in `AGENTS.md` above apply in full. Project settings in `.claude/settings.json` deny secret reads and run guard hooks (`tools/agents/guard-*.mjs`) before every edit and shell command. If a hook blocks you, do not retry with a different command or path to get around it: explain the block to the user and ask.
- Use plan mode for any change that touches more than one project or any migration.
- Before finishing, run the verify command from `AGENTS.md` §2 and paste the summary line.

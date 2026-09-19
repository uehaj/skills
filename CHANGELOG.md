# Changelog

Changes to the `uehaj` plugin in the `uehaj-skills` marketplace. Versions are the plugin version in
`plugins/uehaj/.claude-plugin/plugin.json` (kept equal to the entry in `.claude-plugin/marketplace.json`).

## [Unreleased]

## [0.1.2] - 2026-09-20

### Changed
- `semgrep`: Claude can now invoke the skill on its own when the user asks to find lines by meaning
  (`disable-model-invocation` removed; trigger conditions moved into the description).
  When invoked without a slash command, the last user message is treated as the arguments.

## [0.1.1] - 2026-09-19

### Changed
- `semgrep`: arguments starting with `-` are passed to semgrep unchanged (`-r`, `-C 2`, `--level strict`, ...).
  If the user writes `-e` / `-a` / `-v` themselves, the expression is used as is.
- Marketplace renamed to `uehaj-skills` (install with `claude plugin install uehaj@uehaj-skills`).
- README: single-skill install via the skills CLI (`npx skills add uehaj/skills --skill semgrep -a claude-code -g`).

## [0.1.0] - 2026-09-19

### Added
- Marketplace `uehaj` with plugin `uehaj`.
- `/uehaj:semgrep`: grep by meaning via `@uehaj/semgrep`; falls back to `npx @uehaj/semgrep` when the CLI is not installed.

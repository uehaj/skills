# Changelog

Changes to the `uehaj` plugin in the `uehaj-skills` marketplace. Versions are the plugin version in
`plugins/uehaj/.claude-plugin/plugin.json` (kept equal to the entry in `.claude-plugin/marketplace.json`).

## [Unreleased]

## [0.1.5] - 2026-09-20

### Changed
- `semgrep`: step 1 now says when semgrep pays off (extract-lines task, vocabulary not greppable, more than a few
  dozen lines; break-even measured at about 50 lines) and to fall back to direct reading or grep otherwise,
  saying so in one line.

## [0.1.4] - 2026-09-20

### Changed
- `semgrep`: the git log example now folds each commit into one line with subject, body and changed file
  names (`git log --name-only --format='%x00%h %s %b' | tr ... | semgrep`). Subject lines alone miss commits
  whose subject does not mention what they changed.

## [0.1.3] - 2026-09-20

### Changed
- `semgrep`: back to explicit invocation only (`/uehaj:semgrep` or `/semgrep`); `disable-model-invocation: true`
  restored and the trigger conditions removed from the description. Evaluation showed the skill adds nothing
  when Claude picks it for tasks such as whole-codebase comprehension (same accuracy, about 50% more cost),
  so the user decides when to use it.

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

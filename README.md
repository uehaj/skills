# uehaj/skills

Claude Code plugin marketplace for skills by [uehaj](https://github.com/uehaj).
One plugin, `uehaj`, so every skill is `/uehaj:<skill>`.

```sh
claude plugin marketplace add uehaj/skills     # or: /plugin marketplace add uehaj/skills
claude plugin install uehaj@uehaj              # or: /plugin install uehaj@uehaj
```

Update later with `claude plugin marketplace update uehaj`.

To install a single skill instead of the whole plugin, use the [skills CLI](https://skills.sh/).
It copies the skill into `~/.claude/skills/` (with `-g`) or `./.claude/skills/`, and the skill is then
invoked without the plugin prefix (`/semgrep` instead of `/uehaj:semgrep`).

```sh
npx skills add uehaj/skills --skill semgrep -a claude-code -g
```

## Skills

| Skill | What it does | Needs |
|---|---|---|
| `/uehaj:semgrep <meaning> [files]` | grep by meaning. Finds lines that match a described meaning, in any language, with AND / OR / NOT. | [`@uehaj/semgrep`](https://github.com/uehaj/jev-semgrep) (`npm install -g @uehaj/semgrep`, or the skill falls back to `npx`) and a TypeSafe API key |

## Layout

```
.claude-plugin/marketplace.json     the catalog (marketplace name: uehaj)
plugins/uehaj/
  .claude-plugin/plugin.json        the plugin (name: uehaj)
  skills/<skill>/SKILL.md           one folder per skill
```

Tools the skills call live in their own repositories; this repository holds only the skills.

## License

MIT

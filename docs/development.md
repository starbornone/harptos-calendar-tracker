# Development

## Repository layout

| Path | Purpose |
| --- | --- |
| [README.md](../README.md) | Human entry point and product summary |
| [AGENTS.md](../AGENTS.md) | Repository instructions for coding agents |
| [ROADMAP.md](../ROADMAP.md) | Campaign brief and milestone acceptance examples |
| [docs/](overview.md) | Product, design, workflow, and format references |
| [roadmap/](../roadmap/roadmap.json) | Active, completed, and cancelled work |

The checkout currently has no application entry point, build script, or configured test or lint command. Add exact commands and prerequisites to this guide when the repository gains them.

## Local workflow

1. Check the working tree with `git status --short`. Read [AGENTS.md](../AGENTS.md), then pick an item from the [active roadmap](../roadmap/roadmap.json).
2. Start with the expected behavior and a concrete example from the [campaign brief](../ROADMAP.md). For a clock change, include a boundary such as midnight, a festival, or a year rollover.
3. Verify the affected behavior through the tracker once the relevant interface exists. Compare a jump with repeated single-hour advances when working on weather. Verify reload recovery when changing campaign state or persistence.
4. Review the diff for relative links and accidental edits. For changes to roadmap data, parse all three JSON files and compare project metadata, item IDs, and status fields against the [format contract](roadmap-format.md).
5. Update the relevant docs and move the item only when its acceptance criteria are met. See [Contributing](contributing.md) for what to include with the change.

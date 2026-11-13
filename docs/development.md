# Development

## Repository layout

| Path | Purpose |
| --- | --- |
| [README.md](../README.md) | Human entry point and product summary |
| [AGENTS.md](../AGENTS.md) | Repository instructions for coding agents |
| [ROADMAP.md](../ROADMAP.md) | Campaign brief and milestone acceptance examples |
| [index.html](../index.html) and [src/main.tsx](../src/main.tsx) | Vite page and React entry point |
| [src/App.tsx](../src/App.tsx) and [src/index.css](../src/index.css) | Campaign screen and shadcn/ui theme tokens |
| [src/harptos.ts](../src/harptos.ts) | Calendar date validation, arithmetic, and formatting |
| [test/harptos.test.mjs](../test/harptos.test.mjs) | Node tests for the calendar module |
| [docs/](overview.md) | Product, design, workflow, and format references |
| [roadmap/](../roadmap/roadmap.json) | Active, completed, and cancelled work |

Use Node.js 24 or newer and `npm ci`. Run `npm run dev` for the development server, `npm test` for the domain suite, `npm run check` for strict TypeScript checking, and `npm run build` to check types and produce `dist/`. Use `npm run preview` to serve the production build locally.

Run `npm run lint` and `npm run format:check` for Biome checks. Use `npm run format` to apply formatting. To run the Chromium UI suite locally, install its browser once with `npx playwright install chromium`, build with `npm run build`, then run `npm run test:ui`. Playwright starts the preview server. [GitHub Actions](../.github/workflows/ci.yml) runs the same checks on pull requests and pushes to `main`.

## Local workflow

1. Check the working tree with `git status --short`. Read [AGENTS.md](../AGENTS.md), then pick an item from the [active roadmap](../roadmap/roadmap.json).
2. Start with the expected behavior and a concrete example from the [campaign brief](../ROADMAP.md). For a clock change, include a boundary such as midnight, a festival, or a year rollover.
3. Run `npm test` and `npm run build`. Verify the affected behavior through the tracker when it has an interface. Compare a jump with repeated single-hour advances when working on weather and verify reload recovery when changing persistence.
4. Review the diff for relative links and accidental edits. For changes to roadmap data, parse all three JSON files and compare project metadata, item IDs, and status fields against the [format contract](roadmap-format.md).
5. Update the relevant docs and move the item only when its acceptance criteria are met. See [Contributing](contributing.md) for what to include with the change.

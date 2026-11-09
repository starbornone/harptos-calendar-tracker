# AGENTS.md

## Project

**Harptos Calendar Tracker** (`harptos-calendar-tracker`) is a single-screen Dungeon Master tool for a Forgotten Realms campaign in Neverwinter and Phandalin. The DM can set or advance the clock, switch locations, and see seasonal sunrise and sunset estimates. The browser saves the time and location. A new campaign starts in Neverwinter on 1 Tarsakh 1491 DR, Year of the Scarlet Witch, at 08:00. Faerûnian time markers and hourly weather are planned.

## Layout

- [README.md](README.md) is the human entry point and product summary.
- [ROADMAP.md](ROADMAP.md) is the campaign brief with setting references and milestone examples.
- [index.html](index.html) loads the Vite entry point in [src/main.tsx](src/main.tsx). [src/harptos.ts](src/harptos.ts) contains calendar rules.
- [components.json](components.json) configures shadcn/ui. Campaign theme tokens live in [src/index.css](src/index.css).
- [docs/](docs/overview.md) holds the product, architecture, workflow, and format guides.
- [roadmap/](roadmap/roadmap.json) holds the prioritized work and status history.

## Working agreements

Use Node.js 24 or newer. Run `npm ci` to install, `npm run dev` to start Vite, `npm test` for calendar tests, and `npm run build` for type checking and a production build. Use `git status --short` to see local changes, check relative links, and parse all three roadmap JSON files when editing roadmap data. See [Development](docs/development.md) for behavioral checks.

## Documentation

Keep the README and [overview](docs/overview.md) consistent with supported behavior. Update [Getting started](docs/getting-started.md) with actual launch steps when they exist. Record changes to component responsibilities in [Architecture](docs/architecture.md) and changes to assumptions or scope in [Decisions](docs/decisions.md).

## Roadmap

This project's key is `harptos-calendar-tracker` and its title is `Harptos Calendar Tracker`. Keep the roadmap in three files in `roadmap/` at the repository root.

- [roadmap.json](roadmap/roadmap.json) holds project status and items still to do, highest priority first.
- [completed.json](roadmap/completed.json) holds finished items.
- [cancelled.json](roadmap/cancelled.json) holds dropped items.

All three use this shape.

```json
{
  "schema": "name -roadmap/v1",
  "file": "roadmap",
  "updatedAt": "2026-11-09T11:00:00+11:00",
  "project": {
    "key": "harptos-calendar-tracker",
    "title": "Harptos Calendar Tracker",
    "status": "active",
    "summary": "A Dungeon Master’s tracker for Harptos campaign time, daylight, and hourly weather in Neverwinter and Phandalin."
  },
  "items": [
    {
      "id": "stable-kebab-id",
      "title": "Write a short imperative title",
      "group": "Optional area",
      "notes": "Optional detail"
    }
  ]
}
```

1. `schema` is always `"name -roadmap/v1"`. `file` is `"roadmap"`, `"completed"`, or `"cancelled"` to match the filename.
2. `project.key`, `project.title`, and `project.status` are identical in all three files. Never change `project.key`. `status` is `active`, `paused`, or `complete`. `summary` appears only in `roadmap.json`.
3. Every item has a lowercase kebab-case `id` that is unique across all three files. Never rename or reuse it, including after completion or cancellation. Titles and notes may change freely.
4. Allowed item fields are `id`, `title`, `group`, and `notes`, plus `completedAt` (required in `completed.json` only) and `cancelledAt` (required in `cancelled.json` only) with an optional `reason` in `cancelled.json`. Add no other fields.
5. When work is finished, move the item from `roadmap.json` to the end of `completed.json` and add `completedAt`. When work is dropped, move it to the end of `cancelled.json` and add `cancelledAt` and a short `reason`. Never delete an item outright. To revive cancelled work, move the same ID back to `roadmap.json` and remove `cancelledAt` and `reason`.
6. Each item is in exactly one file. Split work into new items with new IDs and preserve the meaning of the original ID.
7. Set `updatedAt` in every file you change. Use ISO 8601 timestamps with a UTC offset, for example `2026-11-09T11:00:00+11:00`.
8. Keep `roadmap.json` in priority order. Titles are at most 500 characters, notes and reasons are at most 20,000 characters, and each file contains at most 2,000 items.
9. Write valid UTF-8 JSON with two-space indentation, no comments, and no trailing commas. Create a missing file with an empty `items` array.
10. Update the roadmap in the same change as the work it describes. Mark an item completed only once its work is done.

See the [roadmap format](docs/roadmap-format.md) for the import contract and full examples.

## Change boundaries

- Prefer small diffs and keep verification close to the behavior you change.
- Move roadmap items with their work and preserve their IDs.
- Use existing interfaces within the documented campaign scope. Base any new API on explicit requirements.

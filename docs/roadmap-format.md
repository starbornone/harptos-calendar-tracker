# Roadmap import format

An importer reads three UTF-8 JSON files from the root `roadmap/` directory. The active queue is [`roadmap.json`](../roadmap/roadmap.json), finished items are in [`completed.json`](../roadmap/completed.json), and dropped items are in [`cancelled.json`](../roadmap/cancelled.json). Create all three files, using `"items": []` for a file with no entries. Use two-space indentation, with no comments or trailing commas.

## File and project fields

| Field | Rule |
| --- | --- |
| `schema` | Required literal `name -roadmap/v1`. The space before the hyphen is part of the value. |
| `file` | Required value matching the filename stem, either `roadmap`, `completed`, or `cancelled`. |
| `updatedAt` | Required ISO 8601 timestamp with an explicit UTC offset, such as `2026-11-09T11:00:00+11:00`. Refresh it on every changed file. |
| `project.key` | Required permanent lowercase kebab-case project identifier. |
| `project.title` | Required project display title. |
| `project.status` | Required value from `active`, `paused`, and `complete`. |
| `project.summary` | Optional one-line product summary. Allowed in `roadmap.json` only. |
| `items` | Required array with at most 2,000 entries. Keep the active queue highest priority first. |

The `key`, `title`, and `status` values must match across all three files. A title or status change updates all three files together. The key stays the same for the life of the project.

## Item fields

| Field | Rule |
| --- | --- |
| `id` | Required lowercase kebab-case identifier, unique across the three files. Use lowercase letters and digits separated by single hyphens. |
| `title` | Required short imperative string, up to 500 characters. |
| `group` | Optional string naming the work area. |
| `notes` | Optional string, up to 20,000 characters. |
| `completedAt` | Required ISO 8601 timestamp with UTC offset in `completed.json`. Allowed only there. |
| `cancelledAt` | Required ISO 8601 timestamp with UTC offset in `cancelled.json`. Allowed only there. |
| `reason` | Optional string in `cancelled.json`, up to 20,000 characters. Supply a short reason when dropping work. |

These are the allowed item fields. An ID stays attached to the same deliverable and is never renamed, deleted, or reused. Titles and notes can change. To split a deliverable, give the new items new IDs and preserve the original item in the appropriate file.

## Move an item

| Transition | Edit |
| --- | --- |
| To do → completed | Once the work is done, remove the active entry and append it to `completed.json` with `completedAt`. |
| To do → cancelled | Remove the active entry and append it to `cancelled.json` with `cancelledAt` and a short `reason`. |
| Cancelled → to do | Restore the same ID to its priority position in `roadmap.json`. Remove `cancelledAt` and `reason`. |
| Completed → to do | If completion was recorded in error, restore the same item to the queue and remove `completedAt`. Give a new deliverable its own ID. |

Move an item and refresh `updatedAt` in both affected files in the same change as the work. An item appears in exactly one file at a time. See [AGENTS.md](../AGENTS.md) for repository working agreements.

## Minimal examples

These three files describe the same example project. Each item has a different ID.

### `roadmap/roadmap.json`

```json
{
  "schema": "name -roadmap/v1",
  "file": "roadmap",
  "updatedAt": "2026-11-09T11:00:00+11:00",
  "project": {
    "key": "example-tracker",
    "title": "Example Tracker",
    "status": "active"
  },
  "items": [
    {
      "id": "add-date-entry",
      "title": "Add date entry"
    }
  ]
}
```

### `roadmap/completed.json`

```json
{
  "schema": "name -roadmap/v1",
  "file": "completed",
  "updatedAt": "2026-11-09T11:00:00+11:00",
  "project": {
    "key": "example-tracker",
    "title": "Example Tracker",
    "status": "active"
  },
  "items": [
    {
      "id": "document-campaign-start",
      "title": "Document the campaign start",
      "completedAt": "2026-11-09T10:45:00+11:00"
    }
  ]
}
```

### `roadmap/cancelled.json`

```json
{
  "schema": "name -roadmap/v1",
  "file": "cancelled",
  "updatedAt": "2026-11-09T11:00:00+11:00",
  "project": {
    "key": "example-tracker",
    "title": "Example Tracker",
    "status": "active"
  },
  "items": [
    {
      "id": "add-second-campaign",
      "title": "Add a second campaign",
      "cancelledAt": "2026-11-09T10:55:00+11:00"
    }
  ]
}
```

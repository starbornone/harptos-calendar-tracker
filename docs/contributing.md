# Contributing

Look for existing work in the [active roadmap](../roadmap/roadmap.json). If a change is missing, describe the DM task it would improve, the expected result, and a way to verify it. For a lore correction, cite the reference and identify which campaign example or display behavior it affects. For a campaign-specific assumption, record the assumption and its consequence in [Decisions](decisions.md).

Keep each change focused. A clock fix should include the affected input and expected date or time. A weather fix should identify the location, hour, seed if available, and preceding condition. For UI changes, describe the DM action and what should be visible afterward. The [development guide](development.md) explains the checks available in the current checkout.

## Keep documentation and roadmap with the work

- Update the README or [overview](overview.md) when supported capabilities or scope change. Update [Getting started](getting-started.md) when the actual first-run steps change, and [Architecture](architecture.md) when data flow or component ownership changes.
- Use one stable roadmap ID per deliverable. Leave work in the active list while acceptance criteria are still open. Move it to completed or cancelled in the same change that resolves its status, following the [format contract](roadmap-format.md).
- In the change description, include the verification performed and any assumptions a reviewer needs to confirm. If a check requires the future app, describe it as an acceptance check for that item.

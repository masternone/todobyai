# Public Splash Page and Task Route Rename

Status: ready-for-agent

## Parent

.scratch/multi-user-clerk/PRD.md

## What to build

Move the current Task experience off the public root route. The root route becomes the public Splash Page, the primary authenticated Task surface moves to `/task` and is titled Tasks, and the Archive surface moves to `/task/archive` and is titled Archive. The public Splash Page must not initialize Task state or expose Task mutations.

## Acceptance criteria

- [ ] Visiting `/` shows a public Splash Page instead of the Task management UI.
- [ ] The existing primary Task surface is available at `/task` and uses the visible title Tasks.
- [ ] The existing archived Task surface is available at `/task/archive` and uses the visible title Archive.
- [ ] The Tasks surface links to Archive.
- [ ] The Archive surface links back to Tasks.
- [ ] The Task app shell wraps only the Task surfaces, not the Splash Page.
- [ ] Existing Task behavior still works at the new routes before Clerk route protection is added.
- [ ] Route/UI tests or equivalent coverage verify the new route labels and navigation.

## Blocked by

None - can start immediately

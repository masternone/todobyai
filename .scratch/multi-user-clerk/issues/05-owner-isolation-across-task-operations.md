# Owner Isolation Across Task Operations

Status: ready-for-agent

## Parent

.scratch/multi-user-clerk/PRD.md

## What to build

Verify and harden owner-only Task behavior across the complete Task operation set. A signed-in User must see and mutate only their own Active, Completed, and Archived Tasks, and another User's Task ID must not grant read or write access.

## Acceptance criteria

- [ ] A User sees only their own Active Tasks.
- [ ] A User sees only their own Completed Tasks.
- [ ] A User sees only their own Archived Tasks in Archive.
- [ ] Task Filters apply only to the signed-in User's Tasks.
- [ ] Task Sorts order only the signed-in User's Tasks.
- [ ] The Completed Section shows only the signed-in User's Completed Tasks.
- [ ] A User cannot edit another User's Task.
- [ ] A User cannot complete another User's Task.
- [ ] A User cannot archive another User's Task.
- [ ] A User cannot restore another User's Archived Task.
- [ ] A User cannot delete another User's Task.
- [ ] Repository contract tests and/or server boundary tests cover owner isolation for list and mutation operations.

## Blocked by

- .scratch/multi-user-clerk/issues/04-clerk-user-ownership-in-server-functions.md

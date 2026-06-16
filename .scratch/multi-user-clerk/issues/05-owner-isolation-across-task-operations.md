# Owner Isolation Across Task Operations

Status: done

## Parent

.scratch/multi-user-clerk/PRD.md

## What to build

Verify and harden owner-only Task behavior across the complete Task operation set. A signed-in User must see and mutate only their own Active, Completed, and Archived Tasks, and another User's Task ID must not grant read or write access.

## Acceptance criteria

- [x] A User sees only their own Active Tasks.
- [x] A User sees only their own Completed Tasks.
- [x] A User sees only their own Archived Tasks in Archive.
- [x] Task Filters apply only to the signed-in User's Tasks.
- [x] Task Sorts order only the signed-in User's Tasks.
- [x] The Completed Section shows only the signed-in User's Completed Tasks.
- [x] A User cannot edit another User's Task.
- [x] A User cannot complete another User's Task.
- [x] A User cannot archive another User's Task.
- [x] A User cannot restore another User's Archived Task.
- [x] A User cannot delete another User's Task.
- [x] Repository contract tests and/or server boundary tests cover owner isolation for list and mutation operations.

## Blocked by

- .scratch/multi-user-clerk/issues/04-clerk-user-ownership-in-server-functions.md

## Completed

Added repository contract coverage for owner isolation across list, filter, sort, archive, completed-section, and mutation operations. Verified with unit tests, typecheck, and lint.

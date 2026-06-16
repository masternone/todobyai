# Clerk User Ownership in Server Functions

Status: done

## Parent

.scratch/multi-user-clerk/PRD.md

## What to build

Replace the hard-coded `local-user` Task owner with the signed-in Clerk User at the server-function boundary. Task reads and writes must derive the domain User from the Clerk server session, reject signed-out requests, and never trust owner identity from the client.

## Acceptance criteria

- [x] Task list server functions derive the current User from the Clerk server session.
- [x] Task command server functions derive the current User from the Clerk server session.
- [x] Signed-out Task list requests are rejected.
- [x] Signed-out Task command requests are rejected.
- [x] Task creation uses the authenticated Clerk User ID as the Task owner.
- [x] The client does not pass `ownerUserId` or another trusted User identifier for Task operations.
- [x] Existing `local-user` Tasks are not migrated and do not appear for newly authenticated Users unless their Clerk User ID matches.
- [x] Server-function/auth boundary tests verify signed-out rejection and signed-in ownership.

## Blocked by

- .scratch/multi-user-clerk/issues/03-clerk-session-gate-for-task-routes.md

## Completed

All acceptance criteria completed and verified.

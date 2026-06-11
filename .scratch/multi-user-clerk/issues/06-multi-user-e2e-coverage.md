# Multi User E2E Coverage

Status: ready-for-agent

## Parent

.scratch/multi-user-clerk/PRD.md

## What to build

Add end-to-end coverage for the multi User Clerk experience from the User's perspective. The coverage should verify the Splash Page, protected Task routes, deep-link preservation, sign-out return, Tasks and Archive navigation, and cross-User privacy at the app boundary.

## Acceptance criteria

- [ ] E2E coverage verifies signed-out `/` shows the Splash Page.
- [ ] E2E coverage verifies signed-in `/` redirects to `/task`.
- [ ] E2E coverage verifies signed-out `/task` requires sign-in.
- [ ] E2E coverage verifies signed-out `/task/archive` requires sign-in and preserves the deep link.
- [ ] E2E coverage verifies sign-out returns the User to `/`.
- [ ] E2E coverage verifies navigation between Tasks and Archive using the new labels.
- [ ] E2E coverage verifies a signed-in User can create and view their own Task.
- [ ] E2E coverage verifies a second signed-in User does not see the first User's Task.
- [ ] Automated tests use test doubles, fixtures, or Clerk-supported test helpers rather than depending on real Clerk network calls.
- [ ] Existing Task flow coverage still passes at `/task` and `/task/archive`.

## Blocked by

- .scratch/multi-user-clerk/issues/05-owner-isolation-across-task-operations.md

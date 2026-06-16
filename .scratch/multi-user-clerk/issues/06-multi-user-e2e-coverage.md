# Multi User E2E Coverage

Status: done

## Parent

.scratch/multi-user-clerk/PRD.md

## What to build

Add end-to-end coverage for the multi User Clerk experience from the User's perspective. The coverage should verify the Splash Page, protected Task routes, deep-link preservation, sign-out return, Tasks and Archive navigation, and cross-User privacy at the app boundary.

## Acceptance criteria

- [x] E2E coverage verifies signed-out `/` shows the Splash Page.
- [x] E2E coverage verifies signed-in `/` redirects to `/task`.
- [x] E2E coverage verifies signed-out `/task` requires sign-in.
- [x] E2E coverage verifies signed-out `/task/archive` requires sign-in and preserves the deep link.
- [x] E2E coverage verifies sign-out returns the User to `/`.
- [x] E2E coverage verifies navigation between Tasks and Archive using the new labels.
- [x] E2E coverage verifies a signed-in User can create and view their own Task.
- [x] E2E coverage verifies a second signed-in User does not see the first User's Task.
- [x] Automated tests use test doubles, fixtures, or Clerk-supported test helpers rather than depending on real Clerk network calls.
- [x] Existing Task flow coverage still passes at `/task` and `/task/archive`.

## Blocked by

- .scratch/multi-user-clerk/issues/05-owner-isolation-across-task-operations.md

## Completed

Added two-User e2e coverage using the existing test auth double. The test auth path now carries a request-scoped test User ID via cookie so app-boundary server calls can verify private Task ownership without Clerk network calls.

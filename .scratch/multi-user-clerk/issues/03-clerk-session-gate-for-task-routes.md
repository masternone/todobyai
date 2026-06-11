# Clerk Session Gate for Task Routes

Status: ready-for-agent

## Parent

.scratch/multi-user-clerk/PRD.md

## What to build

Wire Clerk into the app routing experience. Signed-out visitors can sign in or sign up from the Splash Page. Signed-in Users who visit `/` are redirected to `/task`. The `/task` and `/task/archive` surfaces require sign-in, preserve protected deep links through sign-in when possible, and return the User to `/` after sign-out.

## Acceptance criteria

- [ ] Clerk is configured through environment variables, including the browser publishable key and server secret key.
- [ ] The Splash Page exposes sign-in and sign-up actions.
- [ ] A signed-in User visiting `/` is redirected to `/task`.
- [ ] A signed-out visitor attempting `/task` is required to sign in.
- [ ] A signed-out visitor attempting `/task/archive` is required to sign in.
- [ ] A protected `/task` deep link lands on `/task` after sign-in.
- [ ] A protected `/task/archive` deep link lands on `/task/archive` after sign-in.
- [ ] Sign-out returns the User to `/`.
- [ ] The app behaves clearly when Clerk environment variables are missing in local development.
- [ ] Route/UI tests or equivalent coverage verify the signed-in, signed-out, and deep-link behaviors without relying on real Clerk network calls in automated tests.

## Blocked by

- .scratch/multi-user-clerk/issues/01-provision-clerk-application-and-local-keys.md
- .scratch/multi-user-clerk/issues/02-public-splash-page-and-task-route-rename.md

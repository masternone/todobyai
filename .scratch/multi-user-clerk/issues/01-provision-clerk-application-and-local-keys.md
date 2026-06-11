# Provision Clerk Application and Local Keys

Status: ready-for-human

## Parent

.scratch/multi-user-clerk/PRD.md

## What to build

Create the Clerk application needed for Todo by AI multi User support and provide local development keys without committing secrets. The app should have local development URLs configured so sign-in, sign-up, redirects, and sign-out can work when the implementation slices wire Clerk into the app.

## Acceptance criteria

- [ ] A Clerk application exists for Todo by AI local development.
- [ ] Clerk is configured to allow local development redirects for `/`, `/task`, and `/task/archive`.
- [ ] `VITE_CLERK_PUBLISHABLE_KEY` is available to the local app environment.
- [ ] `CLERK_SECRET_KEY` is available only to the server-side local app environment.
- [ ] No Clerk secret key is committed to the repository.
- [ ] The implementer has enough information to run and verify Clerk sign-in/sign-up locally.

## Blocked by

None - can start immediately

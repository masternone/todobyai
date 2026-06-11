# Multi User Clerk Support

Status: ready-for-agent

## Problem Statement

Todo by AI currently behaves as a single local User app. The domain already says Tasks belong to a User, and the repository already scopes Task operations by User, but the running app hard-codes the current User as `local-user`. That means more than one real person cannot safely use the app with private Task ownership.

Users need to sign in and see only their own Tasks. They do not need shared Task lists, Teams, Workspaces, or multiple people collaborating on the same Task list.

## Solution

Use Clerk as the managed User service for sign-up, sign-in, sessions, and stable external User IDs. Todo by AI will use the authenticated Clerk User ID as the External User Link and as the owner boundary for Task reads and writes.

The root route becomes a public Splash Page. A signed-out person can sign in or sign up from the Splash Page. A signed-in User who visits the Splash Page is redirected to Tasks. The current primary Task experience moves to `/task`, and Archive moves to `/task/archive`. Both Task surfaces require a signed-in User. If a signed-out person attempts to visit a protected deep link, sign-in should preserve the intended destination.

Todo by AI should not introduce a local User profile yet. Existing `local-user` Tasks can be abandoned; authenticated Users start with their own Task lists.

## User Stories

1. As a visitor, I want to see a public Splash Page at `/`, so that I understand I can use Todo by AI before signing in.
2. As a visitor, I want to start sign-in from the Splash Page, so that I can access my Tasks.
3. As a visitor, I want to start sign-up from the Splash Page, so that I can become a User.
4. As a signed-in User, I want visiting `/` to take me to `/task`, so that I return directly to my Tasks.
5. As a signed-in User, I want to see my primary Tasks surface at `/task`, so that my current work is easy to find.
6. As a signed-in User, I want to see Archive at `/task/archive`, so that Archived Tasks are separate from current work.
7. As a signed-in User, I want the primary surface titled Tasks, so that the product language matches what I am managing.
8. As a signed-in User, I want the archived surface titled Archive, so that it has a concise product label.
9. As a signed-in User, I want navigation from Tasks to Archive, so that I can review Archived Tasks.
10. As a signed-in User, I want navigation from Archive back to Tasks, so that I can return to current work.
11. As a signed-out person, I want visiting `/task` to require sign-in, so that Task data is not available without a User session.
12. As a signed-out person, I want visiting `/task/archive` to require sign-in, so that Archive data is not available without a User session.
13. As a signed-out person following a `/task` deep link, I want to land on `/task` after sign-in, so that my intended destination is preserved.
14. As a signed-out person following a `/task/archive` deep link, I want to land on `/task/archive` after sign-in, so that my intended destination is preserved.
15. As a signed-in User, I want sign-out to return me to `/`, so that I am no longer inside the protected Task app.
16. As a User, I want every Task I create to belong to me automatically, so that I do not need to choose an owner.
17. As a User, I want to see only my own Active Tasks, so that my Tasks are private.
18. As a User, I want to see only my own Completed Tasks, so that completed work remains private.
19. As a User, I want to see only my own Archived Tasks, so that archived work remains private.
20. As a User, I want to edit only my own Tasks, so that another User cannot change my work.
21. As a User, I want to complete only my own Tasks, so that another User cannot change my Task State.
22. As a User, I want to archive only my own Tasks, so that another User cannot remove my Tasks from Tasks.
23. As a User, I want to restore only my own Archived Tasks, so that another User cannot move my work back to Tasks.
24. As a User, I want to delete only my own Tasks, so that another User cannot remove my work.
25. As a User, I want another User's Task IDs to be unusable by me, so that ownership is enforced even if an ID is guessed or leaked.
26. As a User, I want my Task Filters to apply only to my Tasks, so that Past Due and Due Today views do not include another User's work.
27. As a User, I want my Task Sorts to order only my Tasks, so that ordering is private to my Task set.
28. As a User, I want the Completed Section to show only my own Completed Tasks, so that completed work does not leak between Users.
29. As a User, I want Archive to show only my own Archived Tasks, so that archived work does not leak between Users.
30. As a new signed-in User, I want to start with an empty Task list, so that old local development Tasks do not appear in my account.
31. As a returning signed-in User, I want my Tasks to remain associated with the same External User Link, so that my Task list persists across sessions.
32. As a product owner, I want Clerk to manage sign-up, sign-in, and sessions, so that Todo by AI does not own authentication complexity.
33. As a product owner, I want Todo by AI to avoid Teams, Workspaces, and shared Task lists, so that this feature stays focused on private personal Tasks.
34. As a product owner, I want no local User profile until product-specific User properties exist, so that the data model stays minimal.
35. As a developer, I want server functions to derive the current User from Clerk, so that the client never passes a trusted owner ID.
36. As a developer, I want signed-out server function calls rejected, so that Task operations require authentication.
37. As a developer, I want Task repository methods to continue receiving a domain User, so that existing ownership-oriented boundaries remain useful.
38. As a developer, I want Clerk-specific code isolated near auth/session boundaries, so that domain Task behavior remains independent of the auth provider.
39. As a developer, I want the root layout not to initialize Task app state for the Splash Page, so that public pages do not load protected Task data.
40. As a developer, I want the Task app shell to wrap only protected Task surfaces, so that the public and authenticated app boundaries are clear.
41. As a developer, I want existing `local-user` data to be left behind rather than migrated automatically, so that no signed-in User inherits another Task set.

## Implementation Decisions

- Use Clerk as the managed User service for sign-up, sign-in, sessions, and stable external User IDs.
- Respect ADR 0002: Clerk is the source of User identity and sessions, while Todo by AI stores no local User profile until product-specific User properties exist.
- Add Clerk configuration for a browser publishable key and a server secret key.
- Treat the Clerk User ID as the External User Link for the Todo by AI User.
- Do not introduce Account, Workspace, Team, shared Task List, or multiple-owner concepts.
- Do not create a local User profile table in this feature.
- Existing `local-user` Tasks are not migrated and may stop appearing after Clerk is introduced.
- The public root route `/` is the Splash Page.
- Signed-in Users visiting `/` are redirected to `/task`.
- The primary authenticated Task surface is `/task` and is titled Tasks.
- The authenticated archived Task surface is `/task/archive` and is titled Archive.
- Sign-out returns the User to `/`.
- Protected-route sign-in preserves the intended destination when possible.
- Move the Task app shell so it wraps only authenticated Task surfaces.
- The Splash Page should not initialize Task state, list Tasks, or expose Task mutations.
- Server functions must derive the current User from the Clerk server session.
- Server functions must reject Task reads and writes when there is no signed-in User.
- The client must not pass `ownerUserId` or any trusted User identifier for Task operations.
- Task creation uses the authenticated User as owner automatically.
- Task listing, editing, state changes, archiving, restoring, and deleting remain scoped to the owning User.
- The existing Task repository ownership contract should be preserved where practical.
- Visible product copy should use Tasks for the primary Task surface and Archive for the archived surface.
- Domain language should continue to use Archived as the Task State.
- Task Filter remains a choice on Tasks, not a generic view mode.

## Testing Decisions

- Tests should verify external behavior from the User, route, server-function, or repository boundary. They should not assert Clerk internals or implementation details of UI component structure.
- Existing domain tests should continue to cover ownership-neutral Task behavior: Task State transitions, editable fields, Modified Date changes, Created Date immutability, Past Due and Due Today classification, Task Filters, Task Sorts, and Archive behavior.
- Add or update server-function/auth boundary tests to verify signed-out requests are rejected.
- Add or update server-function/auth boundary tests to verify signed-in requests use the Clerk User ID as the Task owner.
- Add or update server-function/auth boundary tests to verify one User cannot read another User's Tasks.
- Add or update server-function/auth boundary tests to verify one User cannot update, change Task State, archive, restore, or delete another User's Tasks.
- Preserve repository contract tests for owner scoping against libSQL. Repository tests should verify that lists and mutations honor the owning User boundary.
- Add or update route/UI e2e tests for signed-out `/` showing the Splash Page.
- Add or update route/UI e2e tests for signed-in `/` redirecting to `/task`.
- Add or update route/UI e2e tests for signed-out `/task` requiring sign-in.
- Add or update route/UI e2e tests for signed-out `/task/archive` requiring sign-in and preserving the deep link.
- Add or update route/UI e2e tests for signed-in Users seeing only their own Tasks.
- Add or update route/UI e2e tests for navigation between Tasks and Archive using the new labels.
- Prefer test doubles or Clerk-supported test helpers at the auth boundary rather than relying on real Clerk network calls in automated tests.
- Prior art exists in the current Task domain tests and Task flow e2e tests; extend those seams where possible.

## Out of Scope

- Shared Task lists.
- More than one User viewing or editing the same Task list.
- Teams, Workspaces, Accounts, Organizations, or roles.
- A local User profile table.
- User preferences, onboarding state, billing state, avatars, display names, or AI personalization.
- Migrating existing `local-user` Tasks into a Clerk User.
- Import/export of abandoned local Tasks.
- Collaboration, invitations, permissions, or access control beyond owner-only Tasks.
- Replacing libSQL.
- Introducing Supabase Auth, Auth0, Better Auth, or another auth provider.
- AI Task drafting or AI-assisted behavior.
- Offline sync or multi-device conflict resolution beyond existing app behavior.

## Further Notes

- The domain glossary has been updated to prefer User, External User Link, Splash Page, Tasks, and Archive.
- The route choice is deliberately `/task` and `/task/archive`.
- The page title is Archive, but Archived remains the Task State.
- Clerk keys needed for local development are `VITE_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`.
- Use Clerk test keys for local development. The publishable key may be exposed to the browser; the secret key must remain server-side and uncommitted.
- ADR 0002 records why Clerk was chosen over Supabase Auth, Auth0, and Better Auth.

# Initial Task App

Status: ready-for-agent

## Problem Statement

Users need a simple way to capture, organize, review, complete, archive, and delete their Tasks without losing track of what still expects progress. The first version of Todo by AI needs to establish the core Task experience before introducing AI assistance.

Users also need the app to be built on a stack that can support reactive Task views now while keeping database churn low if the durable database changes later.

## Solution

Build the first usable Todo by AI app around User-owned Tasks. A User can create Tasks with a required Title, optional Note, optional Due Date, automatically tracked Created Date and Modified Date, and an initial Task State of Active.

The Main View shows Active Tasks prominently. The User can filter Tasks by All, Past Due, or Due Today, and sort Active Tasks by Newest, Oldest, Recently Modified, or By Due Date. The User can optionally show a Completed Section in the Main View; Main View Task Filters determine which Completed Tasks appear there, and the Completed Section is always ordered by Recently Modified. Archived Tasks are excluded from the Main View and shown in a separate Archived View.

Use TanStack Start, TanStack DB, libSQL, and Tailwind CSS. Keep libSQL behind a Task repository and server-function boundary so database-specific details do not leak into route or UI code. TanStack DB should provide the reactive client collection/query layer, while libSQL remains the durable source of truth for v1.

## User Stories

1. As a User, I want to create a Task with a Title, so that I can capture work I intend to complete.
2. As a User, I want a newly created Task to be Active by default, so that it appears in my Main View immediately.
3. As a User, I want to add an optional Note to a Task, so that I can keep longer context without bloating the Title.
4. As a User, I want to add an optional Due Date to a Task, so that I can express when I intend to complete it.
5. As a User, I want Created Date to be tracked automatically, so that I can sort and understand when a Task was captured.
6. As a User, I want Modified Date to be tracked automatically, so that recently changed Tasks can be surfaced consistently.
7. As a User, I want Modified Date to change when Title changes, so that edits affect recency.
8. As a User, I want Modified Date to change when Note changes, so that edits affect recency.
9. As a User, I want Modified Date to change when Due Date changes, so that scheduling edits affect recency.
10. As a User, I want Modified Date to change when Task State changes, so that completion, archive, and restore actions affect recency.
11. As a User, I want Created Date to be non-editable, so that the original capture time stays reliable.
12. As a User, I want to see my Active Tasks prominently in the Main View, so that current work is easy to find.
13. As a User, I want Archived Tasks excluded from the Main View, so that old Tasks do not compete with current work.
14. As a User, I want to navigate to an Archived View, so that I can review Archived Tasks separately.
15. As a User, I want to mark an Active Task as Completed, so that I can record that no further progress is expected.
16. As a User, I want to archive an Active Task, so that I can remove it from the Main View without deleting it.
17. As a User, I want to restore a Completed Task to Active, so that I can continue progress when more work is discovered.
18. As a User, I want to archive a Completed Task, so that completed work can be moved out of ordinary review.
19. As a User, I want to restore an Archived Task to Active, so that archived work can become current again.
20. As a User, I want a checkbox on an Active Task to complete it, so that completing work is fast.
21. As a User, I want a checkbox on a Completed Task to restore it to Active, so that reopening work is fast.
22. As a User, I want edit, archive, and delete icon actions on each Task row, so that common actions are discoverable.
23. As a User, I want to edit a Task's Title, so that I can correct or clarify the work.
24. As a User, I want to edit a Task's Note, so that I can update supporting context.
25. As a User, I want to edit a Task's Due Date, so that I can change my intended completion date.
26. As a User, I want to edit a Task's Task State, so that I can correct or intentionally move it between allowed states.
27. As a User, I want Delete to require confirmation, so that I do not accidentally lose a Task.
28. As a User, I want Delete to be non-recoverable once confirmed, so that deletion has a clear meaning.
29. As a User, I want Delete to be distinct from Archived, so that I can choose between keeping a Task out of view and removing it permanently.
30. As a User, I want the All Task Filter to be the default, so that I see the normal Main View without configuring anything.
31. As a User, I want to filter by Past Due, so that I can focus on Tasks whose Due Date has passed.
32. As a User, I want to filter by Due Today, so that I can focus on Tasks due today.
33. As a User, I want Past Due to be a display condition rather than a Task State, so that a Task can remain Active, Completed, or Archived independently of its Due Date.
34. As a User, I want Due Today to be a display condition rather than a Task State, so that a Task can remain Active, Completed, or Archived independently of its Due Date.
35. As a User, I want Past Due Tasks to be styled differently when visible, so that time-sensitive work is easier to notice.
36. As a User, I want to sort Active Tasks by Newest, so that recently created Tasks appear first.
37. As a User, I want to sort Active Tasks by Oldest, so that long-standing Tasks appear first.
38. As a User, I want to sort Active Tasks by Recently Modified, so that recently changed Tasks appear first.
39. As a User, I want to sort Active Tasks By Due Date, so that Tasks with the nearest Due Dates appear first.
40. As a User, I want Tasks without Due Dates to appear below dated Tasks when sorting By Due Date, so that dated work is prioritized.
41. As a User, I want Tasks without Due Dates to be ordered by Newest after dated Tasks when sorting By Due Date, so that undated Tasks still have a predictable order.
42. As a User, I want to toggle display of the Completed Section, so that I can decide whether completed work belongs in my Main View.
43. As a User, I want Completed Tasks to appear in a separate Completed Section, so that they do not visually compete with Active Tasks.
44. As a User, I want Task Filters to apply to the Completed Section, so that Past Due and Due Today filtering remains consistent.
45. As a User, I want the Completed Section always ordered by Recently Modified, so that newly completed or recently restored work is easiest to review.
46. As a User, I want only my own Tasks to be visible to me, so that my Task set is private by default.
47. As a User, I want only my own Tasks to be modifiable by me, so that Task ownership is clear.
48. As a User, I want only my own Tasks to be deletable by me, so that Task ownership is enforced.
49. As a User, I want any User-created Task to become owned by that User, so that ownership is automatic.
50. As a future product owner, I want the default User ownership rule to be overridable for future user types, so that future authorization models can evolve without rewriting the domain language.
51. As a developer, I want UI code insulated from libSQL details, so that changing databases later causes less churn.
52. As a developer, I want Task persistence behind a repository boundary, so that durable storage can be tested and replaced independently.
53. As a developer, I want server functions to be the app's database boundary, so that route and UI code do not call the database directly.
54. As a developer, I want TanStack DB to provide reactive Task collections, so that Task lists update predictably from the User's perspective.
55. As a developer, I want Tailwind CSS used for styling, so that the first app has a consistent, lightweight styling system.

## Implementation Decisions

- Build the app with TanStack Start as the full-stack React framework.
- Use TanStack Router conventions through TanStack Start for the Main View and Archived View.
- Use Tailwind CSS for styling.
- Use libSQL as the durable database for v1.
- Use TanStack DB in v1 as the reactive client collection/query layer for Tasks.
- Treat libSQL as an implementation detail behind a Task repository and server functions.
- Server functions are the database boundary for the app. Route and UI code should not issue libSQL queries directly.
- The Task repository should expose Task-oriented operations such as creating Tasks, updating editable fields, changing Task State, deleting Tasks, listing Tasks for the Main View, and listing Archived Tasks.
- The Task repository contract should be shaped around domain vocabulary, not database vocabulary.
- A Task belongs to exactly one User by default.
- Only the owning User can view, modify, or delete a specific Task by default.
- The ownership model should leave room for future user types to override the default owner-only rule.
- A Task has a required Title, optional Note, optional Due Date, Created Date, Modified Date, and Task State.
- New Tasks are created as Active.
- Created Date is automatically tracked and not editable.
- Modified Date is automatically tracked and changes whenever Title, Note, Due Date, or Task State changes.
- Allowed Task State transitions are Active to Completed, Active to Archived, Completed to Active, Completed to Archived, and Archived to Active.
- The Main View shows Active Tasks prominently.
- The Main View can show or hide a Completed Section.
- Archived Tasks do not appear in the Main View.
- Archived Tasks appear in a separate Archived View.
- Main View Task Filters are All, Past Due, and Due Today.
- The default Task Filter is All.
- Main View Task Sorts are Newest, Oldest, Recently Modified, and By Due Date.
- Newest sorts by Created Date closest to now first.
- Oldest sorts by Created Date farthest from now first.
- Recently Modified sorts by Modified Date closest to now first.
- By Due Date sorts Tasks with Due Dates closest to now first, then Tasks without Due Dates by Created Date closest to now first.
- Past Due and Due Today are display conditions, not Task States.
- Task Filters apply to the Completed Section.
- The Completed Section always sorts by Recently Modified regardless of selected Task Sort.
- Active Tasks use the selected Task Sort.
- Task rows should have a checkbox on the left for completing or restoring Tasks.
- Task rows should have edit, archive, and delete icon actions on the right.
- Delete is a confirmed, non-recoverable action.
- Delete is distinct from Archive.
- AI Task drafting and AI-assisted behavior are explicitly deferred from v1.

## Testing Decisions

- Tests should verify external behavior from the User or app-boundary perspective and avoid asserting internal implementation details.
- Task domain behavior should be tested for allowed Task State transitions, editable fields, automatic Modified Date updates, Created Date immutability, and Past Due/Due Today classification.
- Delete behavior should be tested as confirmed and non-recoverable at the user-facing seam.
- Task repository behavior should be tested against libSQL through the repository contract, not by coupling tests to route or UI internals.
- Server-function behavior should be tested for create, edit, state change, archive, delete, Main View listing, and Archived View listing.
- Main View UI behavior should be tested from the User's perspective: Active Tasks are prominent, Completed Section can be toggled, Archived Tasks are excluded, Task Filters apply, and Active Tasks follow the selected Task Sort.
- Completed Section UI behavior should be tested to confirm it respects Task Filters and always uses Recently Modified ordering.
- Archived View UI behavior should be tested to confirm Archived Tasks are reachable separately and can be restored to Active.
- Because the repo has no existing app or test suite yet, implementation should establish the initial testing pattern at the highest feasible seams rather than starting with low-level framework internals.

## Out of Scope

- AI Task drafting or AI-assisted Task creation.
- Multiple owners for a Task.
- Sharing Tasks between Users.
- User types beyond the default User.
- Authentication beyond what is necessary to model or stub a current User for v1.
- Reminders, notifications, or calendar integration.
- Automatic state changes when a Due Date passes.
- A trash, undo, or restore flow for deleted Tasks.
- Projects, labels, priorities, subtasks, dependencies, or recurring Tasks.
- Offline sync or multi-device conflict resolution beyond what the chosen stack naturally supports.
- Database providers other than libSQL in the initial implementation.

## Further Notes

- The current domain glossary lives in `CONTEXT.md` and should remain implementation-free.
- The initial stack preference is TanStack Start, TanStack DB, libSQL, and Tailwind CSS.
- The database-change concern should be handled by keeping libSQL isolated behind server functions and a Task repository.
- No ADR exists yet. An ADR may be appropriate if the team wants to record the TanStack Start, TanStack DB, and libSQL stack choice as a deliberate architectural decision before scaffolding.

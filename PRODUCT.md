# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Register

product

## Users

Todo by AI is for individuals managing their own private Tasks. Each User owns their Tasks. Users do not share Task lists.

The primary job is to capture intended work, review what needs attention, and move Tasks through Active, Completed, and Archived states.

## Product Purpose

Todo by AI helps individuals decide, organize, and complete their intended work. It is also an exercise in building software through AI-assisted coding. Success means useful everyday Task capture and review, with changes that remain easy to understand, test, and iterate.

## Operating context

The public Splash Page provides sign-in and sign-up. Signed-in Users manage their private Tasks in Tasks and Archive. Clerk provides User identity and sessions, as recorded in `docs/adr/0002-use-clerk-for-user-identity.md`.

## Capabilities and constraints

- A Task has a required Title and optional Note and Due Date. Created Date and Modified Date are maintained by the app.
- New Tasks are Active. Users can complete, reactivate, archive, and restore Tasks. Archived Tasks return to Active when restored.
- Tasks shows Active Tasks and an optional Completed Section. Archive holds Archived Tasks separately.
- Task Filters include All, Past Due, and Due Today. Task Sort options include Newest, Oldest, Recently Modified, and By Due Date. The Completed Section always uses Recently Modified.
- Delete requires confirmation and permanently removes the Task from the User's accessible Tasks.
- Only the owning User can view, modify, or delete a Task by default.

Use the terminology and definitions in `CONTEXT.md` when naming product concepts. For web controls, preserve accessible native behavior and prefer progressive enhancement, as required by `AGENTS.md`.

## Brand Personality

Practical, clear, experimental. The tone should feel like a capable personal tool with a visible maker spirit: direct labels, calm feedback, and enough character to acknowledge that the app is being built through AI collaboration.

## Anti-references

Do not make this feel like a dense power-user tool. Avoid command-center dashboards, crowded control surfaces, buried settings, excessive keyboard-centric affordances, and todo-app maximalism where every task becomes metadata.

## Design Principles

1. Keep the task visible: controls should support capture, review, completion, and archive without competing with the list.
2. Make AI collaboration legible: the product can acknowledge its AI-built nature through clear structure and thoughtful defaults, not novelty UI.
3. Prefer calm usefulness over density: add capability only when it preserves the feeling of a personal todo list.
4. Use familiar product patterns well: buttons, filters, edit states, and navigation should feel trustworthy before they feel inventive.
5. Leave room for iteration: the interface and code should stay easy to extend through future prompts.

## Accessibility & Inclusion

Target practical WCAG AA behavior for a solo productivity tool: visible focus states, sufficient contrast, keyboard-reachable controls, readable labels, reduced-motion-friendly transitions, and no reliance on color alone for task state.

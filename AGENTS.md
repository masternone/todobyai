## Agent skills

### Issue tracker

Issues are tracked as local markdown files under `.scratch/<feature>/`. See `docs/agents/issue-tracker.md`.

### Triage labels

Triage uses the default canonical labels: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, and `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

This repo uses a single-context domain docs layout with `CONTEXT.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.

## UI implementation

### Prefer progressive enhancement

For UI elements, explore progressive enhancement before adding branching logic. Start with one accessible baseline element or component, then layer improvements through CSS, native platform features, feature detection, and existing design-system variants.

Prefer enhancement when the difference can be expressed as:

- CSS state, media, container, or feature queries
- ARIA or semantic HTML adjustments on the same element
- Existing component props or style variants
- Small interaction upgrades that preserve the same markup and state model
- Graceful degradation when a browser, input mode, viewport, or capability is missing

### Limits on branching

Only introduce separate rendering paths, component forks, user-agent checks, or environment branches when progressive enhancement would make the component harder to understand, less accessible, or materially more fragile.

Before adding a branch, identify:

- The capability, constraint, or product rule that requires it
- The baseline behavior shared by all paths
- The smallest boundary where the branch can live
- How the branch will be tested or manually verified

Avoid branches for cosmetic differences, one-off viewport tweaks, speculative future cases, or browser quirks that can be handled with standards-based feature detection.

### Example: customizable select

When a design asks for a richer select control, keep a native `<select>` as the baseline first. Explore styling and progressive enhancement with platform features such as customizable `<select>` (`appearance: base-select`, `::picker(select)`, `:open`, `::picker-icon`, and `<selectedcontent>`) before replacing the control with a custom listbox or branching by browser.

Use a custom select implementation only when the product behavior cannot be expressed with the native control plus enhancement, and document the accessibility, keyboard, form, and fallback behavior that the custom implementation must preserve.

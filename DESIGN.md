---
name: Todo by AI
description: A calm personal task app built through AI-prompted code iteration.
colors:
  app-canvas: "#f1f5f9"
  surface: "#ffffff"
  text-strong: "#020617"
  text: "#0f172a"
  text-muted: "#64748b"
  border: "#cbd5e1"
  border-soft: "#e2e8f0"
  accent: "#0d9488"
  accent-hover: "#0f766e"
  accent-soft: "#f0fdfa"
  danger-text: "#be123c"
  danger-soft: "#fff1f2"
typography:
  headline:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "normal"
  title:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: "normal"
  body:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 700
    lineHeight: 1.33
    letterSpacing: "normal"
rounded:
  md: "6px"
  lg: "8px"
  full: "9999px"
spacing:
  xs: "6px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  page-sm: "16px"
  page-md: "32px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "0 12px"
    height: "40px"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.md}"
    padding: "0 12px"
    height: "40px"
  field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.md}"
    padding: "0 12px"
    height: "40px"
  task-row:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.lg}"
    padding: "12px"
---

# Design System: Todo by AI

## 1. Overview

**Creative North Star: "The Prompt Bench"**

Todo by AI is a personal workbench: plain enough to trust, structured enough to keep momentum, and visibly shaped by iteration. The interface should feel like a useful surface beside the code editor, not a productivity command center. It keeps the task list in front and lets controls sit close to the work they affect.

The system is restrained by default. It uses familiar product UI patterns, compact but not crowded spacing, native-feeling typography, and one teal accent for action and state. The product can acknowledge its AI-built nature through clarity, editability, and calm defaults; it must not chase novelty UI.

**Key Characteristics:**

- Personal, practical, and legible.
- Light canvas with white working surfaces.
- One accent color reserved for action, selection, and positive state.
- Standard controls that feel easy to extend through future prompts.
- No dense power-user behavior unless the task itself genuinely requires it.

## 2. Colors

The palette is a restrained slate work surface with a single teal signal color and rose reserved for overdue or destructive context.

### Primary

- **Prompt Teal**: Primary actions, selected navigation, selected filters, focus outlines, completed check buttons, and "Due Today" state. Its job is to mark agency, not decorate the page.
- **Prompt Teal Hover**: Hover state for primary actions and completed check buttons.
- **Teal Whisper**: Soft positive state background for due-today badges and active check hover.

### Neutral

- **Workbench Canvas**: Page background. Use it behind the app shell so white task rows read as working surfaces.
- **Paper Surface**: Task rows, dialogs, fields, and buttons at rest.
- **Ink Strong**: Page titles, section titles, and task titles.
- **Ink**: Default readable text.
- **Quiet Ink**: Brand label, metadata, helper copy, empty states, and counts.
- **Rule Line**: Primary borders on buttons, task rows, fields, and section dividers.
- **Soft Rule Line**: Skeleton borders and lower-emphasis placeholders.

### Tertiary

- **Overdue Rose**: Past-due text and destructive or failure messaging.
- **Rose Wash**: Past-due row background and badge fill.

### Named Rules

**The One Signal Rule.** Teal is reserved for primary action, current selection, focus, and positive state. Do not use it as ambient decoration.

**The White Work Surface Rule.** Task rows and forms stay on Paper Surface. The list must remain the most readable element on the page.

## 3. Typography

**Display Font:** System sans stack with platform-native fallback.
**Body Font:** System sans stack with platform-native fallback.
**Label/Mono Font:** No separate label or mono family.

**Character:** The type is native, direct, and quiet. Weight does the hierarchy work; no display face, negative tracking, or decorative type belongs in this product UI.

### Hierarchy

- **Headline** (700, 1.875rem, 1.25): Route titles such as Main View and Archived View.
- **Title** (700, 1.125rem, 1.4): Section headings and dialog headings.
- **Task Title** (600, 1rem, normal): Individual task titles inside rows.
- **Body** (400, 1rem, 1.5): Task notes, due dates, empty states, and general UI text. Prose should stay near 65-75ch when it grows.
- **Label** (700, 0.75rem, 1.33): Form labels, control labels, metadata labels, and the small "Todo by AI" brand mark.

### Named Rules

**The Native Tool Rule.** Use one system sans family everywhere. Do not introduce display fonts into labels, buttons, task rows, or data.

## 4. Elevation

The system is flat by default and uses tonal layering, borders, and spacing before shadows. Shadow is reserved for the task composer dialog, where it clarifies modal depth against a dimmed slate backdrop.

### Shadow Vocabulary

- **Dialog Lift** (`box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)`): Use only for the composer dialog or another temporary overlay that must sit above the task list.

### Named Rules

**The Flat Until Interrupted Rule.** Surfaces are flat at rest. If a shadow appears, the user should understand that something has interrupted the main workflow.

## 5. Components

### Buttons

- **Shape:** Gently squared product corners (6px radius).
- **Primary:** Prompt Teal background with Paper Surface text, 40px minimum height, 12px horizontal padding, 1px border in the same teal.
- **Hover / Focus:** Primary hover shifts to Prompt Teal Hover. Focus uses a visible 2px teal outline with 2px offset.
- **Secondary / Icon:** Paper Surface background, Rule Line border, Ink text. Hover moves to the Workbench Canvas tone. Icon buttons are fixed 40px squares.

### Chips

- **Style:** Badges use full-pill corners, 1px borders, soft state backgrounds, 8px horizontal padding, and bold 0.75rem text.
- **State:** Due Today uses teal. Past Due uses rose. Do not add additional badge colors without a real task-state distinction.

### Cards / Containers

- **Corner Style:** Task rows and dialogs use 8px radius.
- **Background:** Task rows use Paper Surface. Past-due rows may use Rose Wash.
- **Shadow Strategy:** Task rows do not use shadows. Dialogs use Dialog Lift.
- **Border:** Task rows, dialogs, and skeleton rows use Rule Line borders.
- **Internal Padding:** Task rows use 12px. Dialog content uses 16px.

### Inputs / Fields

- **Style:** Paper Surface fill, Rule Line border, Ink text, 6px radius, 40px minimum height, 12px horizontal padding.
- **Focus:** 2px Prompt Teal outline with 2px offset. Do not rely on border color alone.
- **Error / Disabled:** Disabled controls reduce opacity to 50% and use the standard not-allowed cursor. Error styling should use Overdue Rose text with Rose Wash only when a real validation error exists.

### Navigation

- **Style:** Top-right route navigation uses the same button vocabulary as filters. The active route is a primary button; inactive routes are secondary buttons. Icons are 16px lucide strokes and sit before the label.
- **Mobile Treatment:** Navigation wraps naturally below the title. Do not introduce a drawer or sidebar for the current two-route structure.

### Task Row

- **Structure:** 40px state toggle, flexible text column, trailing 40px icon actions. Rows wrap on small screens and keep actions grouped.
- **State:** Completed rows show a filled teal check button. Active rows show an empty white check button with teal hover. Past due rows use Rose Wash across the full row, never a colored side stripe.

## 6. Do's and Don'ts

### Do:

- **Do** keep task rows as the visual center of the screen.
- **Do** use Prompt Teal only for primary action, current selection, focus, and positive task state.
- **Do** keep buttons, filters, route links, and icon actions in the same 40px control vocabulary.
- **Do** use skeleton rows for loading states, matching the task-row layout.
- **Do** preserve visible focus outlines on every interactive control.
- **Do** keep new features understandable through normal product patterns before adding custom behavior.

### Don't:

- **Don't** make this feel like a dense power-user tool.
- **Don't** add command-center dashboards, crowded control surfaces, buried settings, or excessive keyboard-centric affordances.
- **Don't** turn tasks into todo-app maximalism where every task becomes metadata.
- **Don't** use colored side-stripe borders on task rows, alerts, or badges.
- **Don't** add gradient text, glassmorphism, decorative motion, or hero-metric patterns.
- **Don't** introduce a sidebar, command palette, or multi-panel layout until the app has a real workflow that needs it.

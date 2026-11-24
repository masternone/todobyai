---
name: Todo by AI
description: A calm personal task app built through AI-prompted code iteration.
colors:
  app-canvas: "oklch(96.8% 0.009 247)"
  surface: "oklch(99.2% 0.004 247)"
  text-strong: "oklch(18.2% 0.03 255)"
  text: "oklch(27.9% 0.036 257)"
  text-muted: "oklch(50% 0.036 257)"
  border: "oklch(84.7% 0.023 251)"
  control-border: "oklch(62% 0.023 251)"
  border-soft: "oklch(91.6% 0.015 251)"
  accent: "oklch(52% 0.102 183)"
  accent-hover: "oklch(48.6% 0.096 183)"
  accent-soft: "oklch(97.5% 0.025 181)"
  danger-text: "oklch(50.5% 0.185 16)"
  danger-soft: "oklch(97.1% 0.014 17)"
  danger-border: "oklch(82.4% 0.089 18)"
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
    lineHeight: 1.5555555556
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
    height: "44px"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.md}"
    padding: "0 12px"
    height: "44px"
  field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.md}"
    padding: "0 12px"
    height: "44px"
  task-row:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.lg}"
    padding: "12px"
---

# Design System: Todo by AI

## Overview

**Creative North Star: "The Prompt Bench"**

Todo by AI is a personal workbench: plain enough to trust, structured enough to keep momentum, and visibly shaped by iteration. The interface should feel like a useful surface beside the code editor, not a productivity command center. It keeps the task list in front and lets controls sit close to the work they affect.

The system is restrained by default. It uses familiar product UI patterns, compact but not crowded spacing, native-feeling typography, and one teal accent for action and state. The product can acknowledge its AI-built nature through clarity, editability, and calm defaults; it must not chase novelty UI.

**Key Characteristics:**

- Personal, practical, and legible.
- Light canvas with white working surfaces.
- One accent color reserved for action, selection, and positive state.
- Standard controls that feel easy to extend through future prompts.
- No dense power-user behavior unless the task itself genuinely requires it.

## Colors

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
- **Rule Line**: Decorative borders on task rows, dialogs, and section dividers.
- **Control Rule Line**: Essential control boundaries on buttons, checkboxes, and fields. Keep at least 3:1 contrast against the adjacent surface.
- **Soft Rule Line**: Skeleton borders and lower-emphasis placeholders.

### Tertiary

- **Overdue Rose**: Past-due text and destructive or failure messaging.
- **Rose Wash**: Past-due row background and badge fill.

### Named Rules

**The One Signal Rule.** Teal is reserved for primary action, current selection, focus, and positive state. Do not use it as ambient decoration.

**The White Work Surface Rule.** Task rows and forms stay on Paper Surface. The list must remain the most readable element on the page.

## Typography

**Display Font:** System sans stack with platform-native fallback.
**Body Font:** System sans stack with platform-native fallback.
**Label/Mono Font:** No separate label or mono family.

**Character:** The type is native, direct, and quiet. Weight does the hierarchy work; no display face, negative tracking, or decorative type belongs in this product UI.

### Hierarchy

- **Headline** (700, 1.875rem, 1.25): Tasks and Archive route titles.
- **Title** (700, 1.125rem, 1.556): Section headings and dialog headings.
- **Task Title** (600, 1rem, normal): Individual task titles inside rows.
- **Body** (400, 1rem, 1.5): Task notes, due dates, empty states, and general UI text. Prose should stay near 65-75ch when it grows.
- **Label** (700, 0.75rem, 1.33): Form labels, control labels, metadata labels, and the small "Todo by AI" brand mark.

### Named Rules

**The Native Tool Rule.** Use one system sans family everywhere. Do not introduce display fonts into labels, buttons, task rows, or data.

## Layout

Tasks and Archive use a centered container up to 1152px wide, with 16px page padding below 768px and 32px above it. The splash uses a 1024px container with 24px padding below 768px and 40px above it.

Task controls form a single column below 640px, two columns from 640px, and a horizontal row from 1024px. The native sort control fills its track on small screens and is 216px wide from 640px. Its overall height is 46px, including its border.

Task rows use a 44px state-control column and a flexible content column. Actions sit below the content below 768px and move to a trailing column at larger widths. Long titles wrap within the content column. Dialogs use 16px viewport padding and scroll when their content exceeds the available height.

## Elevation & Depth

The system is flat by default and uses tonal layering, borders, and spacing before shadows. Shadow is reserved for modal dialogs and the enhanced native select picker, where it clarifies modal depth against a dimmed slate backdrop.

### Shadow Vocabulary

- **Dialog Lift** (`box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)`): Use for composer and confirmation dialogs above the task list. The enhanced native select picker uses a smaller offset shadow.

### Named Rules

**The Flat Until Interrupted Rule.** Surfaces are flat at rest. If a shadow appears, the user should understand that something has interrupted the main workflow.

## Shapes

Buttons and fields use the medium radius. Task rows and dialog surfaces use the large radius. Status badges use the full radius. Essential control boundaries use Control Rule Line; decorative row dividers use Rule Line.

## Components

### Buttons

- **Shape:** Gently squared product corners (6px radius).
- **Primary:** Prompt Teal background with Paper Surface text, 44px minimum height, 12px horizontal padding, 1px border in the same teal.
- **Hover / Focus:** Primary hover shifts to Prompt Teal Hover. Focus uses a visible 2px teal hover outline with 2px offset and a soft teal outer ring.
- **Secondary / Icon:** Paper Surface background, Control Rule Line border, Ink text. Hover moves to the Workbench Canvas tone. Icon buttons are fixed 44px squares.

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

- **Style:** Paper Surface fill, Control Rule Line border, Ink text, 6px radius, 44px minimum height, 12px horizontal padding.
- **Focus:** 2px Prompt Teal Hover outline with 2px offset and a soft teal outer ring. Do not rely on border color alone.
- **Required fields:** Title has a persistent required label, native required semantics, and an inline validation message.
- **Placeholder:** Use Quiet Ink at full opacity, keeping at least 4.5:1 contrast against Paper Surface.
- **Edit focus:** Entering inline editing focuses Title. Cancel and Save return focus to Edit when the row remains in the list.
- **Error / Disabled:** Disabled controls reduce opacity to 50% and use the standard not-allowed cursor. Error styling should use Overdue Rose text with Rose Wash only when a real validation error exists.

### Navigation

- **Style:** Top-right route navigation uses the same button vocabulary as filters. The active route is a primary button; inactive routes are secondary buttons. Icons are 16px lucide strokes and sit before the label.
- **Mobile Treatment:** Navigation wraps naturally below the title. Do not introduce a drawer or sidebar for the current two-route structure.
- **Task Sort:** Keep one native select. Apply customizable-select styling through CSS feature queries, preserving keyboard and fallback behavior.

### Task Row

- **Structure:** 44px state toggle, flexible text column, trailing 44px icon actions. Rows wrap on small screens and keep actions grouped.
- **Loading:** Use skeletons on the first load only. Preserve rows during refresh, expose the busy state, and keep the existing error/retry feedback.
- **State:** Completed rows show a filled teal check button. Active rows show an empty white check button with teal hover. Past due rows use Rose Wash across the full row, never a colored side stripe.

## Do's and Don'ts

### Do:

- **Do** keep task rows as the visual center of the screen.
- **Do** use Prompt Teal only for primary action, current selection, focus, and positive task state.
- **Do** keep buttons, filters, route links, and icon actions in the same 44px control vocabulary.
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

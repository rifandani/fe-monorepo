---
name: "@workspace/spa"
description: Bulletproof React.js 19 SPA template — accessible Intent UI kit on a calibration bench
colors:
  instrument-blue: "oklch(0.546 0.245 262.881)"
  instrument-blue-fg: "oklch(1 0 0)"
  instrument-blue-subtle: "oklch(0.623 0.214 259.815 / 0.15)"
  instrument-blue-subtle-fg: "oklch(0.488 0.243 264.376)"
  paper: "oklch(1 0 0)"
  cool-graphite: "oklch(0.21 0.006 285.885)"
  violet-paper: "oklch(0.967 0.001 286.375)"
  muted-ink: "oklch(0.552 0.016 285.938)"
  fog: "oklch(0.92 0.004 286.32)"
  fog-fg: "oklch(0.141 0.005 285.823)"
  overlay: "oklch(1 0 0)"
  overlay-fg: "oklch(0.141 0.005 285.823)"
  hairline: "oklch(0.911 0.006 286.286)"
  input-stroke: "oklch(0.871 0.006 286.286)"
  navbar: "oklch(0.995 0 0)"
  sidebar: "oklch(0.985 0 0)"
  bench-teal: "oklch(0.596 0.145 163.225)"
  bench-teal-fg: "oklch(1 0 0)"
  bench-teal-subtle: "oklch(0.696 0.17 162.48 / 0.15)"
  bench-teal-subtle-fg: "oklch(0.508 0.118 165.612)"
  alert-vermillion: "oklch(0.577 0.245 27.325)"
  alert-vermillion-fg: "oklch(0.971 0.013 17.38)"
  alert-vermillion-subtle: "oklch(0.637 0.237 25.331 / 0.15)"
  alert-vermillion-subtle-fg: "oklch(0.505 0.213 27.518)"
  amber-signal: "oklch(0.828 0.189 84.429)"
  amber-signal-fg: "oklch(0.279 0.077 45.635)"
  amber-signal-subtle: "oklch(0.828 0.189 84.429 / 0.2)"
  amber-signal-subtle-fg: "oklch(0.555 0.163 48.998)"
  info-subtle: "oklch(0.685 0.169 237.323 / 0.15)"
  info-subtle-fg: "oklch(0.5 0.134 242.749)"
typography:
  display:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 2
    letterSpacing: "-0.025em"
    fontFeature: '"cv02", "cv03", "cv04", "cv11"'
  headline:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 2
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.5
  body:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.5
  mono:
    fontFamily: "Geist Mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
    fontSize: "0.8125rem"
    fontWeight: 500
    fontFeature: '"ss02", "zero"'
rounded:
  sm: "4px"
  md: "6px"
  lg: "8px"
  xl: "12px"
  "2xl": "16px"
  full: "9999px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.instrument-blue}"
    textColor: "{colors.instrument-blue-fg}"
    typography: "{typography.label}"
    rounded: "{rounded.lg}"
    padding: "6px 12px"
    height: "36px"
  button-primary-hover:
    backgroundColor: "color-mix(in oklab, oklch(1 0 0) 10%, oklch(0.546 0.245 262.881) 90%)"
    textColor: "{colors.instrument-blue-fg}"
    rounded: "{rounded.lg}"
  button-secondary:
    backgroundColor: "{colors.fog}"
    textColor: "{colors.fog-fg}"
    typography: "{typography.label}"
    rounded: "{rounded.lg}"
    padding: "6px 12px"
    height: "36px"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.cool-graphite}"
    typography: "{typography.label}"
    rounded: "{rounded.lg}"
    padding: "6px 12px"
    height: "36px"
  button-plain:
    backgroundColor: "transparent"
    textColor: "{colors.cool-graphite}"
    typography: "{typography.label}"
    rounded: "{rounded.lg}"
    padding: "6px 12px"
    height: "36px"
  input:
    backgroundColor: "transparent"
    textColor: "{colors.cool-graphite}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: "6px 12px"
    height: "36px"
  card:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.cool-graphite}"
    rounded: "{rounded.lg}"
    padding: "24px"
  badge-primary:
    backgroundColor: "{colors.instrument-blue-subtle}"
    textColor: "{colors.instrument-blue-subtle-fg}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "0 7px"
    height: "20px"
  note:
    backgroundColor: "{colors.violet-paper}"
    textColor: "{colors.fog-fg}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: "16px"
---

# Design System: @workspace/spa

## Overview

**Creative North Star: "The Calibration Bench"**

This is an Operate-mode system. Engineers sit at the bench and verify foundations — auth, catalog, theme, i18n — not a consumer brand performing for attention. The kit is cool, precise, and restrained: Inter with optical sizing, one saturated signal, surfaces that rest flat and lift only when they float.

Accessibility is product truth, not a coat of paint. React Aria focus rings, 44px touch targets, and forced-colors fallbacks are part of the craft. Demo screens stay thin; the component catalog is the proof surface.

Visual rejections confirmed by the incumbent kit and the chosen world: marketing-landing spectacle, neon accents, skeuomorphism, decorative illustration, and hover-lift theater.

**Key Characteristics:**

- One accent (Instrument Blue). Status colors are signals, not brand.
- Inter + Geist Mono. No display serif, no second sans.
- Soft-rect 8px default. Pills only for badges, toggles, and circular icon buttons.
- Hybrid depth: tone + hairline at rest; shadow only on overlays.
- Light and dark as equal citizens. Primary chroma does not shift.
- 16px body on mobile, 14px from `sm` up. Page titles stay in the 1.25–1.5rem band.

## Colors

Cool violet-neutral paper with a single saturated blue-indigo as the action voice. Canonical values live in `:root` as OKLCH; dark theme inverts surfaces, not the signal.

### Primary

- **Instrument Blue** (`instrument-blue`): Primary buttons, focus ring, sidebar current, chart-1. The only high-chroma brand voice.
- **On-Primary** (`instrument-blue-fg`): Text and icons on Instrument Blue fills.
- **Instrument Wash** (`instrument-blue-subtle`): 15% wash for badges, selected rows, calendar cells. Dark uses 10%.
- **Instrument Ink** (`instrument-blue-subtle-fg`): Text on the wash; also text links.

### Secondary

- **Fog** (`fog`): Secondary / accent fill — the same token in light. Quiet chrome, pressed nav, hover overlays.
- **Fog Ink** (`fog-fg`): Text on Fog.

No tertiary role. `accent` equals `secondary` in light; do not invent a third brand hue.

### Neutral

- **Paper** (`paper`): App canvas and cards.
- **Cool Graphite** (`cool-graphite`): Primary text.
- **Violet Paper** (`violet-paper`): Muted wells, code chips, default notes.
- **Muted Ink** (`muted-ink`): Secondary copy, placeholders, icon rest state.
- **Hairline** (`hairline`): Default borders, scrollbar thumb.
- **Input Stroke** (`input-stroke`): Field borders at rest (one step stronger than Hairline).
- **Overlay** (`overlay` / `overlay-fg`): Popovers, menus, toasts.
- **Navbar / Sidebar** (`navbar`, `sidebar`): Chrome slightly off Paper so the canvas reads as the work surface.

### Status (not brand)

- **Bench Teal**: Success fills and meters.
- **Alert Vermillion**: Danger fills, invalid borders, required asterisk.
- **Amber Signal**: Warning fills; dark text on the fill (`amber-signal-fg`).
- **Info Wash** (`info-subtle`): Informational notes only — no solid info fill exists.

### Named Rules

**The One Voice Rule.** Instrument Blue occupies ≤10% of any given screen. Its rarity is the point. Never wash a whole view in primary.

**The Same-Signal Rule.** Instrument Blue does not change chroma between light and dark. Only surfaces invert.

**The Status-Is-Not-Brand Rule.** Teal, vermillion, and amber never appear as decorative chrome. They mean a state.

## Typography

**Display Font:** Inter (ui-sans-serif, system-ui) **Body Font:** Inter (same family; optical size 14–32) **Label/Mono Font:** Geist Mono (`ss02`, `zero` for tabular/slashed zero)

**Character:** One grotesque, optically sized, with Inter's cv02–cv04/cv11 features on. Hierarchy is weight and tracking, not a second family. Geist Mono is for code chips and snippets only.

### Hierarchy

- **Display** (600, 1.5rem / 2, tracking-tight): Heading level 1 from `sm` up. Page titles on the bench, not marketing heroes. Login's `text-3xl` welcome is a one-off; do not promote it to the scale.
- **Headline** (600, 1.25rem / 2, tracking-tight): Heading level 2. Section titles in catalog and settings.
- **Title** (600, 1rem / 1.5): Card titles, Heading 4, compact chrome.
- **Body** (400, 0.875rem / 1.5 from `sm`; 1rem / 1.5 on mobile): Default copy and field text. Muted Ink for supporting paragraphs.
- **Label** (500, 0.875rem / 1.5): Buttons, field labels, nav items. Badges drop to 0.75rem / 1.25.
- **Mono** (500, 0.8125rem): Inline `Code` chips.

Mobile body and headings step up one Tailwind size so 16px remains the readable floor on touch.

### Named Rules

**The No-Hero Type Rule.** There is no 3–4rem display scale in this system. If a screen needs spectacle type, the screen is in the wrong mode.

**The Two-Size Body Rule.** Body is 16px on mobile and 14px from `sm`. Do not mix a third body size in the same view.

## Layout

Tailwind's default 4px spacing scale. Recurring gutters: 8 / 16 / 24 / 32 (`sm` / `md` / `lg` / `xl`).

Container is `max-width: 80rem` (`xl`) with 16px horizontal padding. Navbar content can open to `2xl` (96rem). Float navbar caps at `7xl` / `xl` with 16px inset.

Cards use a 24px internal gutter. Fields stack label → control at 8px, control → error at 8px. Form clusters use 24px between fieldsets.

Density is compact-from-`sm`: buttons, inputs, and nav items lose 4–8px of height above the mobile floor, then keep a 44px invisible hit area via `touch-target` on square icon controls.

Login splits 50/50 from `md`: form column `px-10` (`xl:px-20`), decorative column `shadow-2xl`. That split is a sample auth layout, not a global grid.

Breakpoints (Tailwind defaults): `sm` 640px, `md` 768px, `lg` 1024px, `xl` 1280px, `2xl` 1536px.

## Elevation & Depth

Hybrid. Resting surfaces are flat: Paper (or Card, which equals Paper) plus a 1px Hairline and `shadow-xs` so the edge reads, not so the card floats. Dark mode leans even flatter — tooltips drop shadow entirely and keep a ring.

Overlays (popover, modal, sheet, command menu) are the only places structural lift is allowed: `shadow-xs` or `shadow-lg` plus `drop-shadow-xl` and a muted ring (`muted-fg/20`, `border` in dark). Depth is a state of floating, not a property of content.

### Shadow Vocabulary

- **Resting edge** (`box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05)`): Cards, float navbar, float sidebar, inputs-adjacent chrome.
- **Overlay lift** (`box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)` plus `filter: drop-shadow(0 9px 7px rgb(0 0 0 / 0.1))`): Popovers, modals, sheets, command menu.
- **Auth sample only** (`shadow-2xl` on the login decorative pane): Do not reuse on app chrome.

### Named Rules

**The Flat-By-Default Rule.** Surfaces are flat at rest. Shadows appear only as a response to floating (overlay) or to the login sample pane.

**The Ring-Over-Glow Rule.** Focus and hover never use colored drop-shadows. Use a 2–3px ring at 20% Instrument Blue (or the intent color).

## Shapes

Soft-rectangles. The default silhouette is `rounded-lg` (8px) on buttons, cards, inputs, notes, tooltips, nav items. Controls inset by 1px (`calc(var(--radius-lg) - 1px)`) so the inner fill sits inside the border.

- **sm (4px):** Code chips, square badges, tight inner clips.
- **md (6px):** Color swatches.
- **lg (8px):** The system default.
- **xl (12px):** Float navbar shell.
- **2xl (16px):** Modals (`rounded-t-2xl` on mobile, `rounded-2xl` from `sm`).
- **full:** Default badges, switch thumbs, circular icon buttons, progress tracks.

Borders are 1px Hairline or Input Stroke. Overlays add a 1px ring at 15–20% muted. No hard squares, no 24px+ squircles on controls.

### Named Rules

**The Soft-Rect Rule.** 8px is the default corner. Pills are for badges, toggles, and circular icon buttons only.

## Components

Precise and restrained. Confidence lives in focus treatment, not motion. Hover is a 10% overlay mix or a Fog wash — never `translateY`.

### Buttons

- **Shape:** Soft-rect 8px (`rounded-lg`). Circular only when `isCircle`.
- **Primary:** Instrument Blue fill, on-primary text, 15% graphite border, medium weight. Default size `md`: 36px tall from `sm` (40px on mobile), `6px 12px` padding.
- **Hover / Focus:** Hover mixes 10% on-primary into the fill. Focus-visible: 2px outline + 2px ring with 3px Paper offset. Disabled/pending at 50% opacity.
- **Secondary:** Fog fill, Fog Ink text, muted-fg icons.
- **Warning / Danger / Success:** Status fills; same geometry. Do not use as brand.
- **Outline / Plain:** Transparent fill, Hairline border (outline) or no border (plain). Hover washes Fog.

Intents: `primary` | `secondary` | `warning` | `danger` | `success` | `outline` | `plain`. Sizes: `xs`–`lg` and `sq-*` squares.

### Chips

- **Style:** Default Badge is a pill. Primary uses Instrument Wash + Instrument Ink. Outline uses Hairline, no fill.
- **State:** Group hover/focus shifts to a 20% overlay of the intent color. Intents: primary, secondary, success, info, warning, danger, outline.

### Cards / Containers

- **Corner Style:** 8px.
- **Background:** Paper / Card (same token in light).
- **Shadow Strategy:** Resting edge (`shadow-xs`) plus Hairline border. See Elevation.
- **Border:** 1px Hairline.
- **Internal Padding:** 24px gutter; header/content/footer share it. Tables flush and get a muted header well.

### Inputs / Fields

- **Style:** Transparent fill, 8px corners, Input Stroke border, 16px/14px text.
- **Hover:** Border to `muted-fg/30`.
- **Focus:** Border `ring/70`, 3px ring at `ring/20` (Instrument Blue). Invalid swaps to Alert Vermillion subtle-fg and matching ring.
- **Disabled:** Violet Paper fill, 50% opacity.
- **Error / Required:** Field error in Alert Vermillion Ink. Required labels append a vermillion asterisk.

### Navigation

- **Default navbar:** Hairline bottom, Navbar fill. Items are 8px-radius, medium, 14px from `md`. Hover/press → Fog. Current → Cool Graphite.
- **Float navbar:** 12px shell, Hairline, resting edge shadow, content padded 16px.
- **Focus:** 2px ring at 20% Instrument Blue plus inset ring.
- **Mobile:** Grid item layout; desktop row. Sidebar current uses Instrument Blue fill (same signal as primary buttons).

### Note (signature)

Status callout: 8px, 16px padding, 15% current-color border, `backdrop-blur-2xl`, 32px circular indicator. Intents paint the matching subtle wash. Default sits on Violet Paper at 50%. This is how the kit speaks status in-flow — not toast-only, not banner-chrome.

## Do's and Don'ts

### Do:

- **Do** keep Instrument Blue rare (The One Voice Rule) and identical across themes (The Same-Signal Rule).
- **Do** use React Aria focus rings (2px + 20% wash, Paper offset on buttons) as a visible craft detail.
- **Do** default to 8px soft-rects, 24px card gutters, and `shadow-xs` + Hairline on resting surfaces.
- **Do** step type down at `sm` (16px → 14px body) and keep a 44px hit area on square icon controls.
- **Do** put status only in Note, Badge, validation, and meter/progress — never as a decorative wash.

### Don't:

- **Don't** introduce a second brand hue, a display serif, or a 3rem+ hero type scale.
- **Don't** lift cards or buttons on hover (`translateY`, colored drop-shadows, skeuomorphic bevels).
- **Don't** use `shadow-2xl` outside the login sample pane.
- **Don't** paint marketing-landing spectacle, neon, or illustration into app chrome.
- **Don't** fabricate end-user brand claims, testimonials, or a WCAG certification level.

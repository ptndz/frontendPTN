---
name: frontendPTN
description: A mini Facebook-style social network — monochrome soft UI, black primary buttons on white, Onest UI type. Built on Astryx (Meta design system, v0.7.15) with a custom Mono theme.
colors:
  primary: "#111111"
  primary-foreground: "#ffffff"
  primary-bright: "#111111"
  neutral-bg: "#ffffff"
  neutral-card: "#fafafa"
  neutral-ink: "#111111"
  neutral-muted: "#6b7280"
  neutral-border: "#e5e5e5"
  destructive: "#db2424"
  destructive-foreground: "#fdf0f0"
  success: "#16a34a"
  warning: "#d97706"
  presence: "#10b981"
  dark-bg: "#111111"
  dark-card: "#1f1f1f"
  dark-ink: "#fafafa"
  dark-muted: "#a3a3a3"
  dark-border: "#2e2e2e"
  dark-destructive: "#ef4343"
  dark-success: "#22c55e"
  dark-warning: "#f59e0b"
typography:
  headline:
    fontFamily: "Onest, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 700
    lineHeight: 1.2
  title:
    fontFamily: "Onest, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontFamily: "Onest, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  body-post:
    fontFamily: "Onest, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Onest, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.4
  mono:
    fontFamily: "JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  sm: "4px"
  md: "6px"
  lg: "8px"
  xl: "12px"
  2xl: "16px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "9999px"
    padding: "8px 16px"
  button-secondary:
    backgroundColor: "{colors.neutral-ink}"
    textColor: "{colors.neutral-bg}"
    rounded: "9999px"
    padding: "8px 16px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.neutral-ink}"
    rounded: "9999px"
    padding: "8px 16px"
  button-danger:
    backgroundColor: "{colors.destructive}"
    textColor: "{colors.destructive-foreground}"
    rounded: "9999px"
    padding: "8px 16px"
  icon-button:
    backgroundColor: "transparent"
    textColor: "{colors.neutral-ink}"
    rounded: "{rounded.full}"
    size: "44px"
  input:
    backgroundColor: "{colors.neutral-bg}"
    textColor: "{colors.neutral-ink}"
    rounded: "9999px"
    padding: "8px 12px"
    height: "40px"
  card:
    backgroundColor: "{colors.neutral-card}"
    textColor: "{colors.neutral-ink}"
    rounded: "16px"
    padding: "16px"
  chat-bubble-own:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.2xl}"
    padding: "8px 16px"
  chat-bubble-incoming:
    backgroundColor: "{colors.neutral-card}"
    textColor: "{colors.neutral-ink}"
    rounded: "{rounded.2xl}"
    padding: "8px 16px"
  unread-badge:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.full}"
    padding: "2px 6px"
---

# Design System: frontendPTN

## Overview

**Creative North Star: "Mono" — Minimalist Monochrome Soft UI, Apple-inspired
iOS design**

frontendPTN is a mini social network (feed, like/comment/share, friends, realtime
messenger, profiles, bookmarks, admin dashboard) on Next.js 15 Pages Router. It
uses a clean white interface with a neutral grayscale palette, subtle shadows,
and rounded pill components: black primary buttons on white, Onest everywhere,
JetBrains Mono for code/data only. The brand mark is the new geometric
"P" monogram (2026-11-14, `src/components/Share/Logo.tsx` + `public/favicon/logo.svg`):
a single-stroke P in ink color (`currentColor`, so it inverts in dark mode),
with wordmark "PHAM THANH NAM"; the tile variant (black rounded square +
white P) is used only for favicon/app icons. It replaces the old blue 3D
`phamthanhnam.com` logo image, which no longer appears anywhere in the UI. Density is medium: 12–16px gaps, 16px cards, 40px inputs,
44px icon buttons. Mode: Operate — scanability and consistency outrank
expression.

**Key Characteristics:**
- One accent — black in light mode, white in dark mode — used for primary
  actions, selection, and state — never decoration. The accent IS the ink.
- Tonal layering plus soft, shallow shadows: paper, surface, and border are
  close grayscale tints; hover states are tints, not lifts; shadow appears
  only as a response to state or to floating.
- Pill controls: buttons, inputs, composer, chips, and segmented controls
  are pill-shaped (fully rounded); cards and dialogs keep a modest 16px
  radius; long text areas keep 16px — a capsule textarea would look broken.
- Light and dark are both first-class via a `dark` class on `<html>` (see
  `src/hooks/useThemeBootstrap.ts` + `src/plugins/theme.ts`); tokens switch through
  CSS variables, so a single utility (e.g. `bg-paper`) renders correctly in both
  modes and most `dark:` variants were deleted.
- Vietnamese-first UI copy with English mixed in for auth and navigation labels.

## UI Foundation: Astryx (2026-11-13)

The UI is built on **Astryx** (Meta's open-source design system, Beta,
`@astryxdesign/core` + `@astryxdesign/theme-neutral` + `@stylexjs/stylex`
**v0.7.15**, 174 components, CLI `pnpm exec astryx`). The Mono
palette/fonts above are expressed as a custom Astryx theme, not as
hand-written classes (the previous Quiet Switchboard theme is kept as a
registered non-default theme — see Upgrade Notes). See
`docs/plans/2026-11-13-astryx-ui-redo-plan.md` for the full migration plan.

**Theme — `src/themes/mono/`** (`monoTheme.ts`, built `mono.css/.js`,
`mono.fonts.css`, registered via `pnpm exec astryx theme add mono`, default
via `pnpm exec astryx theme use mono`, `src/astryx-themes.ts` generated,
`_app.tsx` imports the built mono theme directly — see the note there). It
`extends` the built neutral theme and overrides only what Mono specifies.
After editing the theme source, rebuild it (`pnpm exec astryx theme build
src/themes/mono/monoTheme.ts`) and re-run `theme add mono` if the slug
changed. The Quiet Switchboard theme (`src/themes/quiet-switchboard/`) is
kept, registered, as a non-default theme — it is the previous system, not
deleted.

| Mono | Astryx token | Light | Dark |
|---|---|---|---|
| paper | `--color-background-body` | `#ffffff` | `#111111` |
| surface | `--color-background-surface/card/popover` | `#fafafa` | `#1f1f1f` |
| ink | `--color-text-primary`, `--color-icon-primary` | `#111111` | `#fafafa` |
| muted | `--color-text-secondary`, `--color-icon-secondary` | `#6b7280` | `#a3a3a3` |
| line | `--color-border` | `#e5e5e5` | `#2e2e2e` |
| accent | `--color-accent` (+ `--color-info`) | `#111111` | `#ffffff` |
| accent-ink | `--color-on-accent` | `#ffffff` | `#111111` |
| accent-bright | `--color-text-accent`, `--color-icon-accent` | `#111111` | `#ffffff` |
| danger | `--color-error` | `#db2424` | `#ef4343` |
| success | `--color-success` | `#16a34a` | `#22c55e` |
| warning | `--color-warning` | `#d97706` | `#f59e0b` |
| presence | (online dot, unchanged) | `#10b981` | `#10b981` |

Typography: `typography.scale {base: 14, ratio: 1.25}` (slightly larger
headings than the 1.2 Quiet Switchboard scale; body stays 14px), body
leading 1.6 on desktop (the theme's small-touch-screen adaptation keeps
1.5 there), body/heading `Onest`, code `JetBrains Mono` (fonts loaded by
the theme's `fonts.css`, verified Google Fonts 200). Radius:
`--radius-element: 9999px` (pill controls — buttons, inputs, selectors,
segmented controls, chips), `--radius-container: 16px` (cards, dialogs,
popovers), `--radius-inner: 8px`, `--radius-chat/page: 28px`; component
overrides pin Button to 9999px, Card/Dialog to 16px, and
`text-area-control` to 16px (long text areas are the one control that
must NOT be a pill). Shadows are soft and shallow: `--shadow-low/med/high`
use 6–8% black in light mode, 30–55% in dark mode (dark surfaces need more
opacity to read). Status *text* tokens use darker shades in light mode
(`#15803d`, `#b45309`, `#b91c1c`) and lighter in dark mode (`#4ade80`,
`#fbbf24`, `#f87171`) for ≥4.5:1 contrast; status *fill* on-colors are
dark text on the light success/warning fills (`#052e16`,
`#1c1917`/`#451a03`) because white text on `#16a34a` is only ~3.3:1.
Muted `#6b7280` on white is ~4.83:1 (passes AA). Everything else
(spacing, motion, categorical hues) is inherited from neutral.

**Dark mode:** the app's theme store (`useStoreTheme`, `useThemeBootstrap`,
`.dark` class on `<html>`) drives the Astryx `<Theme mode>` prop in
`src/pages/_app.tsx` (`mode={theme === "dark" ? "dark" : "light"}`), so the
Astryx dark mode and the Tailwind `.dark` class always switch together.
`mode="system"` is deliberately NOT used — the app has its own toggle.

**What still uses the old tokens:** `src/styles/globals.css` keeps the
`:root`/`.dark` variables + `@theme inline` (`--color-paper`, `--color-surface`,
…) for the not-yet-migrated shared pieces (ads, some shared components) and
the legacy helpers. Those bare names (`--paper`, `--surface`, …) do not
collide with Astryx's `--color-*` tokens. `tailwind-theme.css` is
deliberately NOT imported — it would remap the app's own Tailwind utilities.

**Migration status (2026-11-13):** all 27 pages + the app chrome (Navigation,
sidebars) migrated to Astryx components. Verification: `tsc` 0 errors,
`vitest` 44/44, `astryx doctor --built` 19 pass / 0 fail, `next build`
62/62 pages on nam. `doctor --built` purity baseline is **763 findings**
(down from 3474 before the redo) — the remainder sits in shared components
(`src/components/Share/*`, `ads/*`, `Loaders/*`) and deliberately kept
native elements (hidden file inputs, `<select>`, `<video>`/`<audio>`,
reaction emoji chips, hover action bars). `Badge` is counts only; there is
no Astryx chip component (hashtag/admin pills stay as styled spans).
`react-toastify` (`ToastContainer` in `_app.tsx`) is still the toast system;
`nprogress` is unchanged.

**Rules (see `AGENTS.md` in the repo root, written by `astryx init`):**
no raw `<div>` (layout/spacing via components), style by component props
first then token-backed Tailwind, no raw hex/px, no `style={{…}}`, colors
through the theme never `:root` overrides, dense data as `List`/`Table`
rows not Card-wrapped lists, run `astryx doctor --built <dir>` before
delivering a build. Start each page from a template
(`astryx build "<idea>"` → `astryx template <name> <path>`).

## Colors

A monochrome grayscale palette: one black/white accent over a neutral gray
ramp. Tokens live in `src/styles/globals.css` as `:root` / `.dark` CSS
variables exposed through Tailwind v4 `@theme inline` (`--color-paper`,
`--color-surface`, `--color-ink`, `--color-muted`, `--color-line`,
`--color-accent`, `--color-accent-ink`, `--color-accent-bright`,
`--color-danger`, `--color-success`, `--color-warning`, `--color-presence`).
The Astryx Mono theme (`src/themes/mono/`) carries the same values as
`--color-*` tokens for Astryx components.

### Primary
- **Mono Black** (`#111111` light / `#ffffff` dark): primary buttons,
  own chat bubbles, unread badges, active states, focus rings. Its
  foreground is the opposite (`#ffffff` light / `#111111` dark) in both
  modes — ~16.7:1 either way.
- **Accent Bright** (`#111111` light / `#ffffff` dark): the accent used as
  text, links, or icons. There is no separate bright shade — the accent
  IS the ink, so `text-accent` and `text-accent-bright` are the same value
  in each mode.

### Secondary
- **Ink Button** (`#111111` light / `#fafafa` dark): the `.btn-secondary`
  variant (`.btn-secondary` = `bg-ink text-paper`). The role inverts
  between modes by design — near-black in light, near-white in dark.
  (In light mode it coincides with the primary accent; the two variants
  differ by hover treatment and by intent, not by color.)

### Neutral
- **Paper** (`#ffffff` light / `#111111` dark): app background (`bg-paper`).
- **Surface** (`#fafafa` light / `#1f1f1f` dark): cards, header, dropdowns,
  incoming bubbles, modals (`bg-surface`).
- **Ink** (`#111111` light / `#fafafa` dark): all primary text (`text-ink`).
- **Muted Gray** (`#6b7280` light / `#a3a3a3` dark): secondary text
  (`text-muted`) — 4.83:1 on bg light, ~7:1 on bg dark, passing AA for
  normal text.
- **Border Gray** (`#e5e5e5` light / `#2e2e2e` dark): 1px borders, dividers,
  input strokes (`border-line`, `divide-line`).
- **Destructive Red** (`#db2424` light / `#ef4343` dark): delete, danger, errors.
- **Success Green** (`#16a34a` light / `#22c55e` dark) and **Warning Amber**
  (`#d97706` light / `#f59e0b` dark): status, presence, progress — tokenized, not
  raw Tailwind colors. **Presence Emerald** (`#10b981` both modes): online dot.

### Named Rules
**The Muted-Is-Muted Rule.** `--muted` is genuinely muted in both modes and differs
from `--foreground`; timestamps, helper copy, and secondary text sit one step below
primary text.
**The One Voice Rule.** The primary accent appears on ≤10% of any screen: primary
buttons, own bubbles, unread badges, active row tint. Its rarity is the point.
**The Pill Rule.** Controls are pill-shaped by default (buttons, inputs,
composer, chips, segmented controls). Cards and dialogs keep a modest 16px;
long text areas keep 16px. Do not force a pill where it would break the
component's function.
**The Flat-By-Default Rule.** Surfaces are flat at rest, with soft shallow
shadows only as a response to state or to floating (menus, dialogs, toasts).
Declare elevation once, border or shadow, not both.

## Typography

**Display Font:** none — the largest text is a 30px bold auth heading.
**Body Font:** Onest (400/500/600/700), loaded via Google Fonts `@import` at the top
of `src/styles/globals.css`, with the system sans stack as fallback.
**Mono Font:** JetBrains Mono (400/500) for code, data, and timestamps only — never
for labels, buttons, or prose.

### Hierarchy
- **Headline** (700, 30px / `text-3xl`, tight, `.font-title`): auth headings.
- **Title** (600, 18px / `text-lg`): card titles, dialog titles, section headings.
- **Body** (400, 14px / `text-sm`): list rows, form fields, menu items, comments.
  Post body text is 15px / `text-[15px]` — the one deliberate exception, for
  feed readability.
- **Label** (500, 12px / `text-xs`): timestamps, status lines, helper text, badges.
- **Micro:** the smallest size in the system is 12px — `text-[10px]` / `text-[11px]`
  were raised to `text-xs` everywhere (reaction tooltip text in `reaction.css`
  went 11px → 12px).
- **Mono** (400, 14px JetBrains Mono): code spans, data, commands.

### Named Rules
**The One Family Rule.** Onest does every job. JetBrains Mono is for code, data,
and commands only. No serif voice in UI text.

## Layout

A sticky top navigation (`bg-surface`, bottom `border-line`) over a three-column
feed grid on `lg` (left sidebar / feed / right sidebar, `2xl:max-w-[1560px]`,
`gap-6`); sidebars hide below `lg`. Feed columns scroll independently (`h-[89vh]`,
thin themed scrollbars). Auth pages are a two-panel split (brand panel + form card,
`rounded-2xl bg-surface border-line p-6`). Messenger is a two-pane shell (chat list
+ conversation) with a floating widget (`WidgetMessage`) on the feed. The
dashboard is a stat-card grid. Container padding is 8–24px (`px-2 md:px-4 lg:px-6`).

Spacing rhythm is the Tailwind 0.25rem base: 16px panel padding (`p-4`), 12px gaps
(`gap-3`) between avatar and text, 8px gaps (`gap-2`) inside cards and menus, 4px
gaps (`gap-1`) in icon clusters.

## Elevation & Depth

Flat by default, with tonal layering doing most of the depth work:
background → surface → border are three close grayscale tints, and hover
states are tints (`hover:bg-paper` on a surface card, `hover:bg-surface` on
paper). Shadows are soft and shallow — `shadow-sm` (cards, incoming
bubbles), `shadow-lg` (dropdowns, modals) — from the Mono theme's
`--shadow-low/med/high` tokens (6–8% black in light mode, 30–55% in dark
mode). Overlays: the dialog scrim is `bg-ink/80`, the mobile menu scrim is
`bg-ink/25` (kept from the original 25% opacity).

## Shapes

Two radius languages, documented as intentional: pills (`rounded-full`)
for buttons, inputs, composer, chips, and segmented controls; 16px
(`rounded-2xl`) for cards, modals, and auth panels (the Astryx Card/Dialog
radius is 16px via `--radius-container`); chat bubbles keep the 28px
`--radius-chat` language. Pills (`rounded-full`) for every icon button,
avatar, unread badge, and the comment input. Chat bubbles are asymmetric:
`rounded-2xl` with the tail corner flattened to `rounded-br-md` (own) or
`rounded-bl-md` (incoming). Avatars are always circular; presence dots are
circular with a 2px `ring-surface` outline. Borders are 1px (`border-line`)
everywhere. Long text areas are the exception: 16px, never pill.

## Components

### Buttons
- **Shape:** pill (`rounded-full`); shared classes in `globals.css`:
  `.btn-primary`, `.btn-secondary`, `.btn-ghost`, `.btn-danger`, `.icon-btn`
  (44px circle). Auth submit buttons are `.btn-primary w-full`; inputs are
  `.field` (40px, pill for `input`/`select`, 16px for `textarea`,
  `border-line`, `focus:ring-accent/20`).
- **Primary:** `bg-accent text-accent-ink hover:bg-accent/90`, `h-10 px-4 py-2`,
  `text-sm font-medium`. **Secondary:** `bg-ink text-paper hover:bg-ink/90`.
  **Ghost:** transparent, `hover:bg-surface`. **Danger:** `bg-danger
  text-danger-ink hover:bg-danger/90`.
- **Focus:** global `:focus-visible` — 2px accent outline, 2px offset (in
  `globals.css` base layer). **Disabled:** `opacity-50 pointer-events-none`.

### Chips
- **Unread badge:** `rounded-full bg-accent px-1 text-sm text-accent-ink`,
  capped by count. **Notification badge:** `bg-danger text-danger-ink`.
- **Reaction chips:** LIKE `text-accent-bright`, LOVE `text-danger`,
  HAHA/SAD/WOW/ANGRY `text-warning`.

### Cards / Containers
- **Corner Style:** 16px (`rounded-2xl`) for post cards, sidebar cards, profile
  cards, dashboard stat cards, modals; 28px for chat surfaces.
- **Background:** `bg-surface` with a 1px `border-line` stroke and `shadow-sm`.
- **Internal Padding:** 16px (`p-4`) for cards; 12–20px (`p-3`/`p-5`) where the
  original layout kept its own padding.

### Inputs / Fields
- **Style:** `.field` — `h-10 rounded-full border border-line bg-paper px-3 py-2
  text-sm text-ink placeholder:text-muted` (single-line inputs; multi-line
  textareas keep `rounded-2xl`). The comment input is `.field
  rounded-full`; the messenger composer is pill via `--radius-chat`.
- **Focus:** `focus:border-accent focus:ring-2 focus:ring-accent/20`.
- **Error:** `border-danger` on the field plus `text-sm text-danger` below it
  (auth forms). Disabled: `opacity-50 cursor-not-allowed`.

### Navigation
- **Header:** `bg-surface border-b border-line`, sticky top, `z-40`; logo left,
  icon nav center (Home / Friends / Messages / Bookmarked), theme toggle +
  notification bell + profile menu right — all 44px `.icon-btn` circles.
- **Active nav link:** `bg-accent/10 text-accent-bright`; inactive:
  `text-muted hover:bg-paper hover:text-ink`. Active chat row: `bg-accent/10`
  plus a 3px primary left bar.
- **Dropdowns:** `bg-surface ring-1 ring-line divide-line`, items
  `hover:bg-paper`; read notifications `text-muted`, unread `text-ink`.

### Message Bubble (signature component)
- Own: `bg-accent text-accent-ink rounded-2xl rounded-br-md`, max `75%` width,
  `px-4 py-2`. Incoming: `bg-surface text-ink rounded-2xl rounded-bl-md
  shadow-sm`, with a sender avatar and a 12px muted timestamp. Sending state is
  `opacity-70`; failed is `opacity-90`.

### Post Card (signature component)
- `bg-surface rounded-2xl border-line shadow-sm`; header row (avatar + name + timestamp `text-muted`), body text 15px,
  action row (Like / Comment / Share) with `text-muted` icons that turn
  `text-accent-bright` on active/hover; comment bubbles `bg-paper rounded-2xl`.

### Avatars
- Circular image with a 2px `ring-surface` outline; presence dot at bottom-right
  (`online` presence green, `offline` muted gray). Sizes: 32–48px in lists,
  80px on profiles.

### Toasts
- `react-toastify`, themed in `globals.css`: `bg-surface text-ink border-line
  rounded-2xl shadow-lg`, progress bar `bg-accent`. NProgress bar is accent.

### Skeletons / Loaders
- Skeleton blocks are `bg-line` on `bg-surface` (post skeleton) / `bg-paper`
  (user list skeleton) — tonal, no spinners.

## Do's and Don'ts

### Do:
- **Do** use the semantic tokens (`bg-paper`, `text-ink`, `bg-surface`,
  `border-line`, `bg-accent`, `text-accent-bright`) for every new surface; they
  are the only values that survive the light/dark switch.
- **Do** use `text-accent-bright` for accent text/links/icons — it equals
  `text-accent` in Mono (the accent IS the ink), so either reads the same.
- **Do** keep bubbles asymmetric (flattened tail corner on the sender's side).
- **Do** use pills (`rounded-full`) for buttons, inputs, and icon buttons,
  and 16px radii for cards; long text areas keep 16px, never pill.
- **Do** keep hover states as tints (`hover:bg-paper` on surface, `hover:bg-surface`
  on paper), not lifts.
- **Do** use the shared classes (`.btn-primary`, `.btn-secondary`, `.icon-btn`,
  `.field`, `.card`) for new controls.

### Don't:
- **Don't** use raw Tailwind color utilities (`gray-*`, `zinc-*`, `blue-*`,
  `indigo-*`, `green-500`, `amber-500`, `text-white`, `bg-black`) for new UI —
  the sweep removed them (one commented-out dead block in `LeftSideBar.tsx`
  still contains some; it does not render).
- **Don't** use `text-accent` for body text — the accent is near-black /
  near-white and reads as ink; body text uses `text-ink` / `text-muted`.
- **Don't** add a display font or a serif voice to UI text; Onest is the only UI
  family.
- **Don't** use decorative gradients on buttons or cards — flat accent or surface.
- **Don't** use emoji as icons; reactions are user content and stay as emoji.
- **Don't** invent a new radius or shadow scale; pick from the existing ones.
- **Don't** hide the only way to act behind hover.

---

## Upgrade Notes (working notes, not part of the system)

Mode: Operate. Sources read 2026-11-10: `src/styles/globals.css`,
`src/pages/{index,[username],login,register,forgotpassword,resetpassword/[token],confirmation/[token],friends,messenger,notification,404,dashboard/index,post/[uuid],posts/bookmarked}.tsx`,
`src/components/{Auth,Home,Messages,Share,FriendsCom,Bookmarked,Dashboard,Loaders,userProfile,Email,ads}/*`,
`src/styles/{messenger.module.css,reaction.css,Error.module.css}`,
`src/hooks/useThemeBootstrap.ts`, `src/plugins/theme.ts`, `src/pages/_app.tsx`,
`src/pages/_document.tsx`; greps over all of `src/` for color utilities, hex
literals, arbitrary values, and gradients. No browser run (no Chrome on this VM).

### What changed, per area

**Token layer — `src/styles/globals.css` (rewritten):** Tailwind v4 `@theme inline`
with `:root` / `.dark` CSS variables; Onest 400–700 + JetBrains Mono 400–500 via
Google Fonts `@import`; breakpoints xs 460px / md 840px kept; shared component
classes `.btn-primary`, `.btn-secondary`, `.btn-ghost`, `.btn-danger`,
`.icon-btn`, `.field`, `.card`, `.font-title`; base layer themes `::selection`,
`:focus-visible` (2px accent outline), caret color, thin line-colored scrollbars,
NProgress bar, and react-toastify surfaces. Legacy helpers kept (`.customModal`,
`.show`, `.left-sidebar`, `.left-second-sidebar` — orange `#e37326` became
accent — `.conversation:hover`, `.bg-pattern-login`).

**Feed (`pages/index.tsx`, `components/Home/*`, `components/Bookmarked/*`,
`components/Loaders/*`, `pages/post/[uuid].tsx`):** page background `bg-paper`;
post cards → `.card` / `rounded-xl border-line bg-surface`; comment bubbles
`bg-paper rounded-2xl`; comment input `.field rounded-full`, send button flat
`bg-accent`; reactions mapped (LIKE accent-bright, LOVE danger, rest warning);
Create Post form `rounded-xl border-line bg-surface`; left-sidebar icon tiles
unified to accent/danger/success/warning; Load More → `.btn-secondary w-full`;
skeletons `bg-line` on `bg-surface`; post detail page `bg-paper`.

**Auth (`components/Auth/*`, `pages/login|register|forgotpassword|resetpassword|confirmation/*`):**
form panels `bg-surface rounded-xl`; headings `.font-title text-ink`; all inputs
`.field`; submit buttons `.btn-primary w-full`; black/white inverted buttons →
`.btn-secondary`; links `text-accent-bright`; dividers `border-line`; password
toggle `text-muted hover:text-ink`; confirmation spinner `border-accent`.

**Profile (`pages/[username].tsx`, `components/userProfile/*`):** header + About
cards `bg-surface rounded-xl`; cover `rounded-xl`; friend-action buttons unified
to `.btn-primary` / `.btn-secondary`; modals `bg-surface rounded-xl`, inputs
`.field`, Update → `.btn-primary`.

**Friends / Notification / Dashboard / 404:** friend cards `rounded-xl
border-line bg-surface`; See-profile state buttons `bg-accent` / `bg-danger`;
notification page visual-only (badges `bg-accent`, rows `hover:bg-paper`,
timestamps `text-muted` — mock content untouched); dashboard stat cards → `.card`
with one layout, progress bars `bg-success`, status text tokenized; 404 button
via `Error.module.css` (accent button, ink title, muted message).

**Messenger / Navigation / Modals (`components/Messages/*`, `components/Share/*`,
`pages/messenger.tsx`):** header `bg-surface border-b border-line`; nav links
active `bg-accent/10 text-accent-bright`; all round buttons `.icon-btn`;
dropdowns `bg-surface ring-line divide-line`; own bubbles `bg-accent
text-accent-ink rounded-2xl rounded-br-md`, incoming `bg-surface text-ink
rounded-2xl rounded-bl-md shadow-sm`; composer `rounded-2xl border-line
bg-paper`; active chat row `bg-accent/10` + 3px accent left bar; presence dots
`bg-presence ring-surface`; unread badges `bg-accent`; modals `bg-surface
rounded-xl border-line`; scrim `bg-ink/80` (mobile menu keeps `bg-ink/25`).

**CSS modules:** `messenger.module.css` submit button teal → accent;
`reaction.css` toolbox `#fff` → surface, legend tooltip ink/paper, 11px → 12px;
`Error.module.css` title/sms/button tokenized.

**Sweep totals:** 50 files changed by the UI sweep (`globals.css` + 49
component/page/css files); 55 files in `src/{components,pages,styles}` differ
from HEAD because the dependency upgrade that landed just before shares some of
the same files. Zero `dark:` variants remain in `src/` (outside `src/gql/` and
one commented-out dead block in `LeftSideBar.tsx`); zero `text-[10px]` /
`text-[11px]`; zero decorative gradients.

### Verification (2026-11-10)
- `npx tsc --noEmit` — exit 0, no errors.
- `yarn build` — exit 0 (BUILD_ID `9mRgd4f4jh7VJrcOWzgTH`), all 14 routes
  built; `/post/[uuid]` SSG with 0 paths (stub returned `getAllPostIds: []`).
  Build ran against a temporary stub GraphQL server on `127.0.0.1:8080` (file
  `/tmp/stub-gql.cjs`, deleted afterwards). **Gotcha found while verifying:**
  `yarn build` runs `env-cmd -f .env.local`, and env-cmd v11 **overrides shell
  environment variables** with the `.env.local` values — exporting
  `NEXT_PUBLIC_URL_GRAPHQL=http://localhost:8080/graphql` in the shell did NOT
  take effect (the first build hung ~9 min in "Collecting page data" calling
  `https://mxhserver.test/graphql`, then was killed by a VM restart). The
  working build temporarily pointed `.env.local` at the stub, then restored the
  file byte-identical from backup (verified with `diff`). The stub was killed
  and deleted afterwards.
- Built CSS verified: the 75 KB bundle contains `--paper:#dfdedb` (light) /
  `--paper:#26251e` (dark), `#2456d6`, `Onest`, and the `bg-paper` /
  `text-ink` / `bg-accent` utilities.
- **Not verified:** live visual check — no Chrome on this VM; the user must open
  the app in a real browser.

### Judgment calls / open items
- **`ChatWidget` own/inverted logic left untouched:** the component renders the
  own-message bubble gray on the left and the other-side bubble accent on the
  right (call-site passes `own={message?.user.id !== user?.id}`) — that reads
  inverted and is a behavior question, not a visual one; left for a separate
  decision.
- **LeftSideBar commented-out block (lines ~79–120)** still contains old
  `bg-indigo-400` / `bg-lime-400` classes — dead code that does not render;
  left untouched to keep the diff clean.
- **Notification page is still mock UI** (hardcoded "23", no data fetching) —
  out of scope by rule; only its colors were tokenized.
- **Dashboard `Card` component exists but is not used** by `dashboard/index.tsx`
  (inline stat cards instead) — left as-is; unifying would be a small refactor.
- **`.env.local` is still the placeholder** pointing at `mxhserver.test` (restored
  after the build); the app cannot run against a real backend until it points at
  one.
- **Success/warning have no `-ink` tokens:** text on `bg-success` / `bg-warning`
  chips uses `text-accent-ink` / `text-ink` as the readable choice; add
  `--success-ink` / `--warning-ink` if more status chips appear.

### Astryx UI redo (2026-11-13)
- Installed Astryx 0.7.15 (`core` + `theme-neutral` + `stylex`, CLI dev);
  custom Quiet Switchboard theme (`src/themes/quiet-switchboard/`, built +
  registered, `src/astryx-themes.ts`); `_app.tsx` wrapped in `Theme` +
  `LinkProvider`; `globals.css` + `@layer` line + 3 Astryx CSS files
  (`tailwind-theme.css` left out — it would remap the app's own utilities).
- Migrated in order: Phase 0 (theme, dark-mode unification, Navigation +
  sidebars) then P1 Auth → P2 Feed → P3 Post → P4 Profile → P5 Messenger
  (Astryx Chat family; typing/seen/reaction/reply/edit/unsend + call logic
  untouched, only UI around it) → P6 Friends → P7 Groups → P8 Events →
  P9 Marketplace → P10 Pages → P11 Search/Explore/Hashtag → P12
  Notifications → P13 Settings → P14 Dashboard → P15 Bookmarked/404.
  No behavior, API, route, or i18n change in any page.
- Verification (2026-11-13): `tsc --noEmit` 0 errors, `vitest` 44/44,
  `astryx doctor --built` 19 pass / 4 warn / 0 fail, `next build` 62/62
  pages on nam, frontend restarted (`/login` 200). Purity 3474 → 763.
- Two environment notes from this round: a `next build` on this VM stalls
  at "Collecting page data" (~7 min, process sleeping, no `.next` writes)
  — killed; the same build passes on nam (62/62), so it is the VM, not
  Astryx. The VM was replaced mid-round (pnpm had to be reinstalled).
- Next: mobile-friendly pass (layouts at 375px, verified by screenshots) —
  not yet done at the time of writing.

### Mobile-friendly pass (2026-11-14)
- Audit of 26 pages at 375px (50 measurements, 45 screenshots, Playwright +
  Chromium headless, `~/workspace/loadtest/mobile-audit/`): only 2 pages
  overflowed (feed 101px, explore 107px — same cause: the comment Like
  reaction picker toolbox, 300px, escaping its Card). Heavy-but-not-overflowing
  issues: header 166px/2 rows, profile action buttons off-viewport right,
  login/register labels + password-eye clipped, Messenger stuck in the
  desktop 2-column layout, search tab "Người dùng" truncated.
- Fixes: header 56px/1 row (toggle + LanguageSwitcher fold into the mobile
  drawer under `lg`; desktop byte-identical); reaction picker media query
  ≤640px + `relative` anchors in SinglePost/Comments/Comment; Messenger
  1 column under 640px (2 columns from 640px — `lg:` would also collapse
  768px, caught and fixed) + Back button + full-screen conversation +
  GroupMembersPanel/MediaGallery as full overlays; profile header wraps
  (`wrap="wrap"`, `min-w-0`); auth forms `px-4 lg:px-0`; search
  SegmentedControl `layout="hug"`; full-bleed `-mx-2 sm:mx-0` for post
  columns in explore/search/hashtag.
- Verification: all 28 pages 0px overflow at 375px (final-verify.json +
  `shots/*-375-final.png`); `tsc` 0 errors, `vitest` 44/44, `doctor --built`
  19 pass / 4 warn / 0 fail; purity 763 → 783 (new responsive classNames,
  doctor still 0 fail). Nam build 62/62 + tests 44/44 + doctor 19/4/0,
  frontend restarted, `/login` 200. Sync 178 files ALL MATCH.
- Left as-is: confirmation/[token] spins forever on an invalid token
  (needs a behavior decision, not a mobile fix); group/event/product
  detail pages not verified with real data (seed has none); explore keeps
  one 2px offender (doc overflow still 0px). Rate limit 429 was the biggest
  obstacle — workaround: API login with a distinct `X-Forwarded-For` +
  cookie injection (scripts in `mobile-audit/`).

### Mono theme (2026-11-14)
- New default theme replacing Quiet Switchboard: Minimalist Monochrome
  Soft UI, Apple-inspired iOS design — white paper `#ffffff`, surface
  `#fafafa`, ink `#111111`, muted `#6b7280` (4.83:1 on white, AA), border
  `#e5e5e5`; accent **black** `#111111` in light mode / **white** `#ffffff`
  in dark mode (bg `#111111`/`#171717`, surface `#1f1f1f`, ink `#fafafa`,
  border `#2e2e2e`, muted `#a3a3a3`). Status colors stay semantic and
  unchanged from Quiet Switchboard (success `#16a34a`/`#22c55e`, warning
  `#d97706`/`#f59e0b`, error `#db2424`/`#ef4343`, presence `#10b981`).
- Design language: pill controls by default (`--radius-element: 9999px` —
  buttons, inputs, selectors, segmented controls, chips; Button pinned to
  9999px by component override), cards/dialogs/popovers at a modest 16px
  (`--radius-container`), long text areas at 16px via a
  `text-area-control` override (a capsule textarea would look broken),
  chat composer at `--radius-chat: 28px`. Soft shallow shadows
  (`--shadow-low/med/high`: 6–8% black light, 30–55% dark). Typography:
  base 14, ratio 1.25 (headings one step larger), body leading 1.6 on
  desktop (1.5 on small touch screens, per the theme's own adaptation).
  Onest + JetBrains Mono unchanged.
- Files: new `src/themes/mono/` (`monoTheme.ts`, `monoTheme.doc.mjs`,
  built `mono.css/.js/.d.ts/.css.d.ts/.variants.d.ts`, `mono.fonts.css`
  hand-written like quiet-switchboard's); registered via
  `astryx theme add mono`, default via `astryx theme use mono`
  (`src/astryx-themes.ts` `defaultThemeSlug: 'mono'`); `_app.tsx` imports
  the built mono theme directly (the registry is NOT imported — Pages
  Router global-CSS rule). Quiet Switchboard theme files kept, registered,
  non-default. `globals.css` `:root`/`.dark` variables + shared classes
  (`.btn-*` pill, `input/select.field` pill, `textarea.field` 16px,
  `.card` 16px, toast 16px) mirror the mono palette for the not-yet-
  migrated shared pieces. `reaction.css`: the Like label focus ring was a
  hardcoded Facebook blue `rgba(88,144,255,0.3)` — now the accent at 30%
  via `color-mix`.
- Verification (this VM): `tsc --noEmit` 0 errors, `vitest` 44/44,
  `astryx doctor --built` 19 pass / 4 warn / 0 fail; purity 783 → 791
  (the +8 is the new mono CSS/font imports in `src/astryx-themes.ts` +
  `_app.tsx`, same class of finding as the quiet-switchboard imports).
  Screenshots: `~/workspace/loadtest/mono-theme/shots/` (feed, login,
  profile, Messenger, settings at 375px + 1280px, light + dark feed).
  `next build` NOT run on this VM (stalls at "Collecting page data" —
  environmental); parent verifies the build on nam.
- Left as-is: `LeftSideBar.tsx` commented-out dead block still contains
  old `bg-indigo-400` classes (does not render); the small-touch-screen
  body-leading adaptation (1.5) overrides the theme's 1.6 there by design.

### Logo mới (2026-11-14)
- Monogram "P" hình học vẽ bằng một nét liền (`M20 50V14h13a11 11 0 0 1
  0 22H20`, stroke 10/64, đầu/bó tròn), component
  `src/components/Share/Logo.tsx` dùng `currentColor` nên tự đảo
  trắng ở dark mode; wordmark "PHAM THANH NAM" (Onest bold,
  tracking-widest). Header: mark 32px + wordmark chỉ từ `lg`; drawer
  mobile: mark 32px + wordmark; 4 trang auth (login/register/forgot/
  reset): mark 48px + wordmark text-lg.
- Favicon/app icon: bản tile (ô vuông đen `#111111` bo 14/64 + P trắng)
  — `public/favicon/logo.svg` (vector gốc) + `logo.png` 512px và bộ
  favicon sinh lại từ tile này: `favicon.ico` (16/32/48),
  `favicon-16x16.png`, `favicon-32x32.png`, `apple-touch-icon.png`
  (180), `android-chrome-192x192.png` / `512x512.png` (manifest giữ
  nguyên đường dẫn); `_document.tsx` thêm link apple-touch-icon +
  icon 32px. Logo cũ (P xanh 3D + chữ xanh) đã xóa khỏi mọi chỗ dùng.
- Không động tới: mark "Story Builder" trong
  `src/components/Story/builder/ui/layout/DashboardLayout.tsx` (icon
  Sparkles riêng của builder, không phải logo thương hiệu) và
  `next-seo.config.ts` (không có ảnh logo). `public/sw.js` là file
  sinh bởi next-pwa, tự cập nhật hash precache khi build.
- Verification: `tsc` 0 lỗi, `vitest` 44/44; live (Playwright, xem
  `~/workspace/loadtest/desktop-redo/shots/logo/`): header desktop
  1280px + mobile 375px + trang login với logo mới, favicon GET 200.

### Story redo (2026-11-14)
- Tin chữ (text story) mới: preset nền (15 màu + 6 gradient) và phông/cỡ
  chữ lấy từ code admin botbanhang (chỉ subset nền + chữ, không copy slide
  builder/animation/audio), render ra ảnh PNG 1080x1920 bằng canvas rồi
  đăng qua flow ảnh sẵn có (POST /image -> POST /stories) — không đổi
  backend. Viewer tách thành `StoryViewer` riêng: thanh tiến trình thật
  (ảnh 5s, video tối đa 15s/hết clip), giữ để tạm dừng, tap trái/phải và
  phím mũi tên để chuyển, Escape đóng, bấm vào từng đoạn tiến trình để
  nhảy. Nút "Chữ" (pill đen, Astryx Button) nằm cạnh ô "Tin của bạn" trên
  vòng story. Xem trước tin chữ trong composer render bằng DOM với cùng
  preset (nền gradient hiện đúng gradient). Viewer luôn đen ở cả hai mode
  (bg-black/text-white cố định — token ink đảo trắng ở dark mode nên dùng
  token sẽ làm viewer trắng và chữ/progress chìm trên ảnh; tiền lệ
  FollowListModal dùng bg-black/50 cho overlay). Sửa một bug nhỏ ở
  `useStoryPlayback` (foundation): effect reset progress chạy cùng commit
  với rAF effect nên story mới bị tính thời gian từ progress của story cũ
  (chuyển story xong chỉ chạy phần còn lại rồi hết sớm); dùng progressRef
  để reset đồng bộ — sau fix, tap/phím chuyển story nào cũng bắt đầu từ 0%.

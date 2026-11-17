/**
 * Mono — the app's monochrome design system, as an Astryx theme.
 *
 * Extends the built neutral theme and overrides only what DESIGN.md
 * specifies: white paper, near-black ink, black primary buttons in
 * light mode (white in dark mode), Onest + JetBrains Mono.
 *
 * Design language: Minimalist Monochrome Soft UI, Apple-inspired
 * iOS design — clean white interface, subtle shadows, rounded pill
 * components, neutral grayscale palette, modern typography.
 * The default CONTROL language is pill: `--radius-element` is
 * 9999px, so Buttons, TextInputs, Selectors, SegmentedControls and
 * chips come out pill-shaped. Cards / dialogs / popovers keep a
 * modest 16px (`--radius-container`) and long text areas keep 16px
 * via a `text-area-control` component override — a capsule textarea
 * would look broken, so the pill rule stops there. Shadows are soft
 * and shallow (low/med/high), never flat, never heavy, and only as
 * a response to state or to floating.
 * Typography: base stays 14px, ratio 1.25 (slightly larger headings
 * than the 1.2 Quiet Switchboard scale), body leading 1.6.
 *
 * Token values are [light, dark] tuples — Astryx compiles them to
 * light-dark() and the Theme's `mode` prop switches between them.
 *
 * Contrast notes (pairs I hand-wrote, so I own them — see theme.template.ts):
 * - Accent #111111 with #ffffff on top is ~16.7:1 in light mode; in
 *   dark mode the accent flips to #ffffff with #111111 on top
 *   (~16.7:1 the other way): fine in both modes.
 * - Accent-as-text uses the same black/white as the fill
 *   (--color-text-accent #111111 light / #ffffff dark), because the
 *   accent IS the ink — no separate bright shade is needed.
 * - Muted #6b7280 on white paper is ~4.83:1 (passes AA for normal
 *   text); dark-mode muted #a3a3a3 on #111111 is ~7:1.
 * - Status colors stay semantic (they convey meaning, so they are
 *   NOT black): same muted shades as quiet-switchboard.
 * - Success fill #16a34a is too light for white text (~3.3:1), so
 *   --color-on-success is dark green #052e16 in both modes (like Astryx
 *   does for warning). Same logic for warning (dark text both modes).
 * - Error fill #db2424 keeps the app's danger-ink #fdf0f0 in light mode
 *   (the app's btn-danger convention, ~3.9:1); dark mode fill #ef4343 is
 *   lighter, so it takes dark text #1c1917 (~5.5:1).
 * - Status *text* tokens use darker shades in light mode (#15803d,
 *   #b45309, #b91c1c) and lighter shades in dark mode (#4ade80, #fbbf24,
 *   #f87171) so they hold >= 4.5:1 against their surface.
 *
 * The app's Tailwind tokens (:root --paper/--surface/--ink/... in
 * globals.css) mirror this palette for the not-yet-migrated pages.
 * They use bare names (--paper, --surface) that do not collide with
 * Astryx's --color-* tokens, and @theme inline keeps the app's values
 * in its own utilities. This theme only drives Astryx components.
 *
 * Build for production (Next.js SSR): after editing, run
 *   pnpm exec astryx theme build src/themes/mono/monoTheme.ts
 *   pnpm exec astryx theme add mono
 * then import the theme in _app.tsx (the Pages Router entry — it
 * imports the built theme JS + CSS directly; src/astryx-themes.ts is
 * the CLI-generated registry and is NOT imported, see the note there).
 */
import {defineTheme} from '@astryxdesign/core/theme';
import {neutralTheme} from '@astryxdesign/theme-neutral/built';

export const monoTheme = defineTheme({
  name: 'mono',
  extends: neutralTheme,

  typography: {
    scale: {base: 14, ratio: 1.25},
    body: {
      family: 'Onest',
      fallbacks: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
    },
    heading: {weight: 'semibold'},
    code: {
      family: 'JetBrains Mono',
      fallbacks: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    },
  },

  // Pill controls (see header note): element radius is 9999px so
  // buttons / inputs / selectors / segmented controls read as pills;
  // containers (cards, dialogs, popovers) stay a modest 16px.
  // The radius scale's base/multiplier only generate the defaults —
  // the explicit token overrides below win over them, token by token.
  radius: {base: 4, multiplier: 1},

  // Component overrides — standard CSS properties only (the pipeline
  // expands them into the component's internal vars).
  components: {
    // Buttons are pills even where the button rule falls back to the
    // element radius instead of --radius-full.
    button: {
      base: {borderRadius: '9999px'},
    },
    // Cards / dialogs keep the modest 16px container radius.
    card: {
      base: {borderRadius: '16px'},
    },
    dialog: {
      base: {borderRadius: '16px'},
    },
    // Long text areas are the one control that must NOT be a pill:
    // a capsule textarea looks broken, so the control box keeps 16px
    // even though --radius-element (which feeds --_field-radius) is
    // 9999px for every other field.
    'text-area-control': {
      base: {borderRadius: '16px'},
    },
    // Chat bubbles — Mono: own messages are black with white text
    // (DESIGN.md), incoming stay neutral. Astryx paints BOTH senders
    // with --color-neutral by default, so without this the two sides
    // are only told apart by alignment. The ghost variant (media,
    // stickers, attachments) keeps a transparent background — the
    // 'variant:ghost' rule below must win over 'sender:user' for those.
    'chat-message-bubble': {
      'sender:user': {
        backgroundColor: 'var(--color-accent)',
        color: 'var(--color-on-accent)',
      },
      'variant:ghost': {backgroundColor: 'transparent'},
    },
  },

  tokens: {
    // Radius — pill control language + modest containers.
    '--radius-element': '9999px',
    '--radius-container': '16px',
    '--radius-inner': '8px',
    '--radius-page': '28px',
    '--radius-chat': '28px',

    // Generous body line-height (iOS-like hierarchy).
    '--text-body-leading': '1.6',

    // Shadows — soft and shallow, never flat, never heavy. Light mode
    // stays whisper-quiet; dark mode needs a touch more opacity to
    // read against the near-black surfaces.
    '--shadow-low': [
      '0 1px 2px rgb(0 0 0 / 0.06), 0 2px 8px rgb(0 0 0 / 0.06)',
      '0 1px 2px rgb(0 0 0 / 0.30), 0 4px 12px rgb(0 0 0 / 0.35)',
    ],
    '--shadow-med': [
      '0 2px 4px rgb(0 0 0 / 0.06), 0 8px 16px rgb(0 0 0 / 0.08)',
      '0 4px 8px rgb(0 0 0 / 0.40), 0 12px 24px rgb(0 0 0 / 0.45)',
    ],
    '--shadow-high': [
      '0 4px 8px rgb(0 0 0 / 0.08), 0 16px 32px rgb(0 0 0 / 0.12)',
      '0 8px 16px rgb(0 0 0 / 0.50), 0 24px 48px rgb(0 0 0 / 0.55)',
    ],

    // Accent — black in light mode, white in dark mode (the primary
    // button color flips with the mode, like the ink does).
    '--color-accent': ['#111111', '#ffffff'],
    '--color-on-accent': ['#ffffff', '#111111'],
    '--color-accent-muted': ['#11111133', '#ffffff3f'],

    // Surfaces — paper (page) / surface (card, popover).
    '--color-background-body': ['#ffffff', '#111111'],
    '--color-background-surface': ['#fafafa', '#1f1f1f'],
    '--color-background-card': ['#fafafa', '#1f1f1f'],
    '--color-background-popover': ['#fafafa', '#1f1f1f'],
    '--color-background-muted': [
      'rgba(17,17,17,0.06)',
      'rgba(250,250,250,0.10)',
    ],
    '--color-background-inverted': ['#111111', '#fafafa'],

    // Text / icon — ink / muted.
    '--color-text-primary': ['#111111', '#fafafa'],
    '--color-text-secondary': ['#6b7280', '#a3a3a3'],
    '--color-text-disabled': ['#a3a3a3', '#737373'],
    '--color-text-accent': ['#111111', '#ffffff'],
    '--color-icon-primary': ['#111111', '#fafafa'],
    '--color-icon-secondary': ['#6b7280', '#a3a3a3'],
    '--color-icon-disabled': ['#a3a3a3', '#737373'],
    '--color-icon-accent': ['#111111', '#ffffff'],

    // Borders — line / emphasized.
    '--color-border': ['#e5e5e5', '#2e2e2e'],
    '--color-border-emphasized': ['#d4d4d4', '#525252'],

    // Overlays — hover / pressed / neutral fills.
    '--color-overlay-hover': [
      'rgba(17,17,17,0.05)',
      'rgba(250,250,250,0.05)',
    ],
    '--color-overlay-pressed': [
      'rgba(17,17,17,0.10)',
      'rgba(250,250,250,0.10)',
    ],
    '--color-neutral': ['rgba(17,17,17,0.10)', 'rgba(250,250,250,0.20)'],

    // Status — fills from DESIGN.md (same as quiet-switchboard);
    // on-colors per the notes above.
    '--color-success': ['#16a34a', '#22c55e'],
    '--color-on-success': ['#052e16', '#052e16'],
    '--color-success-muted': ['#16a34a1f', '#22c55e26'],
    '--color-on-success-muted': ['#15803d', '#4ade80'],
    '--color-text-success': ['#15803d', '#4ade80'],

    '--color-warning': ['#d97706', '#f59e0b'],
    '--color-on-warning': ['#1c1917', '#451a03'],
    '--color-warning-muted': ['#d977061f', '#f59e0b26'],
    '--color-on-warning-muted': ['#b45309', '#fbbf24'],
    '--color-text-warning': ['#b45309', '#fbbf24'],

    '--color-error': ['#db2424', '#ef4343'],
    '--color-on-error': ['#fdf0f0', '#1c1917'],
    '--color-error-muted': ['#db24241f', '#ef434326'],
    '--color-on-error-muted': ['#b91c1c', '#f87171'],
    '--color-text-error': ['#b91c1c', '#f87171'],

    // Info follows the accent (black/white), not a blue.
    '--color-info': ['#111111', '#ffffff'],
    '--color-on-info': ['#ffffff', '#111111'],
    '--color-info-muted': ['#1111111f', '#ffffff26'],
    '--color-on-info-muted': ['#111111', '#ffffff'],
    '--color-text-info': ['#111111', '#ffffff'],

    // Skeleton / track — line color.
    '--color-skeleton': ['#e5e5e5', '#2e2e2e'],
    '--color-track': ['#e5e5e5', '#2e2e2e'],

    // Focus ring follows the accent.
    '--focus-outline-color': 'var(--color-accent)',
  },
});

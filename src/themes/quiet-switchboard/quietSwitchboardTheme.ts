/**
 * Quiet Switchboard — the app's own design system, as an Astryx theme.
 *
 * Extends the built neutral theme and overrides only what DESIGN.md
 * specifies: stone-blueprint surfaces, accent #2456d6, Onest + JetBrains
 * Mono, radius 4px base. Everything else (spacing, shadows, motion,
 * categorical data hues) is inherited from neutral.
 *
 * Token values are [light, dark] tuples — Astryx compiles them to
 * light-dark() and the Theme's `mode` prop switches between them.
 *
 * Contrast notes (pairs I hand-wrote, so I own them — see theme.template.ts):
 * - Accent #2456d6 with #f4f8ff on top is ~5.9:1 in both modes: fine.
 * - Accent-as-text in dark mode uses #9db6f5 (--accent-bright), because
 *   #2456d6 on dark paper #26251e is only 2.47:1 (known DESIGN.md issue).
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
 * globals.css) stay untouched for the not-yet-migrated pages. They use
 * bare names (--paper, --surface) that do not collide with Astryx's
 * --color-* tokens, and @theme inline keeps the app's values in its own
 * utilities. This theme only drives Astryx components.
 *
 * Build for production (Next.js SSR): after editing, run
 *   pnpm exec astryx theme build src/themes/quiet-switchboard/quietSwitchboardTheme.ts
 *   pnpm exec astryx theme add quiet-switchboard
 * then import {themes, defaultThemeSlug} from the generated
 * src/astryx-themes.ts in _app.tsx.
 */
import {defineTheme} from '@astryxdesign/core/theme';
import {neutralTheme} from '@astryxdesign/theme-neutral/built';

export const quietSwitchboardTheme = defineTheme({
  name: 'quiet-switchboard',
  extends: neutralTheme,

  typography: {
    scale: {base: 14, ratio: 1.2},
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

  radius: {base: 4, multiplier: 1},

  tokens: {
    // Accent — #2456d6 in both modes (DESIGN.md: filled controls only
    // in dark mode; the fill itself does not change).
    '--color-accent': ['#2456d6', '#2456d6'],
    '--color-on-accent': ['#f4f8ff', '#f4f8ff'],
    '--color-accent-muted': ['#2456d633', '#2456d63f'],

    // Surfaces — paper (page) / surface (card, popover).
    '--color-background-body': ['#dfdedb', '#26251e'],
    '--color-background-surface': ['#d3d2ce', '#313029'],
    '--color-background-card': ['#d3d2ce', '#313029'],
    '--color-background-popover': ['#d3d2ce', '#313029'],
    '--color-background-muted': [
      'rgba(38,37,30,0.06)',
      'rgba(223,222,219,0.10)',
    ],
    '--color-background-inverted': ['#26251e', '#dfdedb'],

    // Text / icon — ink / muted.
    '--color-text-primary': ['#26251e', '#dfdedb'],
    '--color-text-secondary': ['#5a5850', '#9e9d99'],
    '--color-text-disabled': ['#a8a7a2', '#6f6e6a'],
    '--color-text-accent': ['#2456d6', '#9db6f5'],
    '--color-icon-primary': ['#26251e', '#dfdedb'],
    '--color-icon-secondary': ['#5a5850', '#9e9d99'],
    '--color-icon-disabled': ['#a8a7a2', '#6f6e6a'],
    '--color-icon-accent': ['#2456d6', '#9db6f5'],

    // Borders — line / emphasized.
    '--color-border': ['#b7b6b1', '#4a4943'],
    '--color-border-emphasized': ['#8f8e88', '#6a6963'],

    // Overlays — hover / pressed / neutral fills.
    '--color-overlay-hover': [
      'rgba(38,37,30,0.05)',
      'rgba(223,222,219,0.05)',
    ],
    '--color-overlay-pressed': [
      'rgba(38,37,30,0.10)',
      'rgba(223,222,219,0.10)',
    ],
    '--color-neutral': ['rgba(38,37,30,0.10)', 'rgba(223,222,219,0.20)'],

    // Status — fills from DESIGN.md; on-colors per the notes above.
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

    '--color-info': ['#2456d6', '#2456d6'],
    '--color-on-info': ['#f4f8ff', '#f4f8ff'],
    '--color-info-muted': ['#2456d61f', '#2456d626'],
    '--color-on-info-muted': ['#2456d6', '#9db6f5'],
    '--color-text-info': ['#2456d6', '#9db6f5'],

    // Skeleton / track — line color.
    '--color-skeleton': ['#b7b6b1', '#4a4943'],
    '--color-track': ['#b7b6b1', '#4a4943'],

    // Focus ring follows the accent.
    '--focus-outline-color': 'var(--color-accent)',
  },
});

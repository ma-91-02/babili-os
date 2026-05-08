# Babili Design System

## Brand Colors

| Token              | Value     | Usage                                              |
| ------------------ | --------- | -------------------------------------------------- |
| `$color-main`      | `#614AE1` | Primary brand color, buttons, links, active states |
| `$color-bg`        | `#F0EEFF` | Page background                                    |
| `$color-secondary` | `#E1DCFF` | Secondary elements, badges, hover states, borders  |

## Semantic Colors

| Token            | Value     | Usage                    |
| ---------------- | --------- | ------------------------ |
| `$color-success` | `#22C55E` | Success states (limited) |
| `$color-warning` | `#F59E0B` | Warning states (limited) |
| `$color-error`   | `#EF4444` | Error states (limited)   |
| `$color-info`    | `#3B82F6` | Info states (limited)    |

## Neutral Colors

| Token                   | Value     | Usage                        |
| ----------------------- | --------- | ---------------------------- |
| `$color-white`          | `#FFFFFF` | Cards, surfaces              |
| `$color-black`          | `#0A0A1A` | Headings, primary text       |
| `$color-text`           | `#1A1A2E` | Body text                    |
| `$color-text-secondary` | `#6B6B80` | Secondary text, placeholders |

## Typography

- **Font (default):** Inter, system sans-serif
- **Font (Arabic/RTL):** Noto Kufi Arabic, Tajawal

## Spacing & Sizing

- `$border-radius-sm: 6px`
- `$border-radius-md: 12px`
- `$border-radius-lg: 20px`

## Shadows

- `$shadow-sm: 0 1px 3px rgba(97, 74, 225, 0.08)`
- `$shadow-md: 0 4px 12px rgba(97, 74, 225, 0.12)`
- `$shadow-lg: 0 8px 30px rgba(97, 74, 225, 0.16)`

## Transitions

- `$transition-fast: 150ms ease`
- `$transition-normal: 250ms ease`

## Breakpoints

- `$breakpoint-sm: 640px`
- `$breakpoint-md: 768px`
- `$breakpoint-lg: 1024px`
- `$breakpoint-xl: 1280px`
- `$breakpoint-2xl: 1536px`

## Layout

- `$max-width: 1440px`
- `$sidebar-width: 280px`
- `$header-height: 64px`

## Design Principles

1. Use only official Babili colors
2. Responsive: mobile-first, all breakpoints
3. RTL support via `dir` attribute
4. No crowded layouts
5. Modern SaaS feel with Babylon-inspired subtle patterns
6. Clean dashboard aesthetic
7. No ERP-like appearance

## File Location

All design tokens are defined in:
`apps/web/styles/_tokens.scss`

Global styles and component base classes are in:
`apps/web/styles/globals.scss`

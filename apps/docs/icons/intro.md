---
slug: /
title: Takeoff Icons
sidebar_label: Overview
sidebar_position: 1
---

# Takeoff Icons

A framework-agnostic icon library shipped as the `@takeoff-icons/*` packages.
Pick the package that fits your stack — React, an icon font, raw SVG, or the
framework-neutral core data.

## Variant model

Every icon is available across a matrix of **style × type**:

- **Style** — `outlined` or `filled`
- **Type** — `rounded`, `sharp`, `bevel`, or `tk`

A full variant is written `style/type`, e.g. `outlined/rounded`. Browse all
icons and switch variants live in the [Gallery](./gallery).

## Sizing & color

Icons render at `1em` by default and inherit text color via `currentColor`, so
they scale with surrounding font size and take their color from CSS `color`:

```tsx
// 24px icon in the brand color, just by styling the parent
<span style={{ fontSize: 24, color: 'var(--brand)' }}>
  <AddIconOutlinedRounded />
</span>
```

Override per-icon with standard SVG props (`width`, `height`, `color`, …) since
each React component forwards `SVGProps<SVGSVGElement>`.

## Packages

| Package                | Use it for                             |
| ---------------------- | -------------------------------------- |
| `@takeoff-icons/react` | React components, one per icon variant |
| `@takeoff-icons/font`  | Icon font (CSS classes / ligatures)    |
| `@takeoff-icons/svg`   | Raw optimized SVG files                |
| `@takeoff-icons/core`  | Metadata, search index, and SVG data   |

Head to [Installation](./installation) to add the package you need.

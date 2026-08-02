---
name: takeoff-skeleton
description:
  Use the Skeleton component from @takeoff-ui/react-spar to reserve layout and
  represent content that is still loading. Use whenever building, importing,
  styling, or fixing skeleton loaders, shimmer placeholders, loading cards,
  avatar placeholders, text placeholders, or content-loading layouts in a
  Takeoff / Spar React app.
---

# Skeleton — @takeoff-ui/react-spar

Use `Skeleton` to preserve the shape of pending content and reduce layout shift.
It is a visual placeholder, not a status announcement or progress indicator.

**When to use:** First-load placeholders for content whose layout you already
know — cards, list rows, avatars, text lines, table cells. Reach for it when
leaving the space blank would make the page jump once data arrives. Not this —
use `takeoff-spinner` for short, indeterminate waits with no known shape (a
saving button, an inline refresh), and `takeoff-progress` when completion is
measurable.

## Quick start

```tsx
import { Skeleton } from '@takeoff-ui/react-spar';

<Skeleton width={240} height={20} />;
```

## Common patterns

```tsx
<div className="flex items-center gap-3" aria-busy="true">
  <Skeleton shape="circle" width={48} height={48} />
  <div className="grid gap-2">
    <Skeleton width={180} height={16} />
    <Skeleton width="12rem" height={12} />
  </div>
</div>

<Skeleton width="100%" height={120} animation="none" />
```

## Card placeholder

Match the eventual layout closely so loading completion does not move nearby
content.

```tsx
<div className="grid gap-3" aria-busy="true">
  <Skeleton width="100%" height={160} />
  <Skeleton width="70%" height={18} />
  <Skeleton width="45%" height={14} />
</div>
```

Numbers resolve to pixels; strings accept any CSS length. Rectangle width fills
its container when omitted. For a circle, use equal width and height.

## Key props

| Prop          | Type                                    | Default         | Notes                              |
| ------------- | --------------------------------------- | --------------- | ---------------------------------- |
| `shape`       | `'rectangle' \| 'circle'`               | `'rectangle'`   | Placeholder silhouette.            |
| `animation`   | `'shimmer' \| 'none'`                   | `'shimmer'`     | Animated or static treatment.      |
| `width`       | `string \| number`                      | container width | Number means pixels.               |
| `height`      | `string \| number`                      | —               | Number means pixels.               |
| `aria-hidden` | `boolean \| 'true' \| 'false'`          | `true`          | Keep the placeholder non-semantic. |
| `classNames`  | `Partial<Record<SkeletonSlot, string>>` | —               | `root` and `shimmer` classes.      |
| `slotProps`   | `SlotPropsMap<SkeletonSlot>`            | —               | Per-slot attributes and styles.    |

## Accessibility and usage rules

- Do not put meaningful text or controls inside Skeleton; it does not accept
  children and is hidden from the accessibility tree.
- Do not use Skeleton as the loading announcement. Apply `aria-busy` to the
  content region or add a labelled Spinner/status when an announcement matters.
- Avoid focusable placeholder elements. Render the real control only when it is
  ready.
- Use `animation="none"` when a static placeholder is preferable; the shimmer
  recipe also respects reduced-motion behavior.

Read `references/full-docs.md` for sizing examples, animation behavior, all
props, slots, data attributes, accessibility, and type definitions.

## Source

- Docs: `apps/docs/docs/components/skeleton.mdx`
- Component: `packages/react-spar/src/components/skeleton/`

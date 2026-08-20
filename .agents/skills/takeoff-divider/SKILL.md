---
name: takeoff-divider
description:
  Use the Divider component from @takeoff-ui/react-spar to separate content
  sections with horizontal or vertical lines and optional aligned labels. Use
  whenever building, importing, styling, or fixing a divider, separator, rule,
  section break, or labeled "OR" separator in a Takeoff / Spar React app.
---

# Divider — @takeoff-ui/react-spar

Use `Divider` to create semantic or decorative boundaries between related
content. It is a standalone Takeoff component rather than a Spar primitive.

**When to use:** Separating sections of a page, groups in a list or menu, or
items in a horizontal toolbar — optionally with a label ("OR") in the middle.
Not this — reach for spacing, a heading, or `takeoff-card` when the goal is
grouping content rather than drawing a line between it.

## Quick start

```tsx
import { Divider } from '@takeoff-ui/react-spar';

<Divider>OR</Divider>;
```

## Common patterns

```tsx
<Divider />
<Divider appearance="dashed" />
<Divider align="start">Passenger details</Divider>

<div className="flex h-12 items-center">
  <span>Economy</span>
  <Divider orientation="vertical" />
  <span>Business</span>
</div>
```

## Labeled and decorative separators

Use label content for a visible choice boundary. Mark purely visual rules as
decorative; do not use `decorative` on a divider that communicates a real
section boundary.

```tsx
<Divider align="start">Payment details</Divider>
<Divider>OR</Divider>
<Divider decorative />
```

## Customization

The line uses `currentColor`, so changing the root color updates solid, dashed,
and dotted appearances. Target the label slot for typography and spacing.

```tsx
<Divider appearance="dashed" style={{ color: '#38bdf8' }} />

<Divider
  classNames={{ label: 'uppercase tracking-widest' }}
  slotProps={{ label: { style: { paddingInline: 24 } } }}
>
  Alternative
</Divider>
```

## Key props

| Prop          | Type                                   | Default        | Notes                                         |
| ------------- | -------------------------------------- | -------------- | --------------------------------------------- |
| `children`    | `ReactNode`                            | —              | Optional label between the line segments.     |
| `orientation` | `'horizontal' \| 'vertical'`           | `'horizontal'` | Axis of the separator.                        |
| `appearance`  | `'solid' \| 'dashed' \| 'dotted'`      | `'solid'`      | CSS line style.                               |
| `align`       | `'start' \| 'center' \| 'end'`         | `'center'`     | Label position along the line.                |
| `decorative`  | `boolean`                              | `false`        | Removes the rule from the accessibility tree. |
| `classNames`  | `Partial<Record<DividerSlot, string>>` | —              | Classes for `root` and `label`.               |
| `slotProps`   | `SlotPropsMap<DividerSlot>`            | —              | Per-slot HTML attributes and styles.          |

## Accessibility

- Add `decorative` only when the line carries no semantic meaning. Otherwise it
  renders `role="separator"` with the matching `aria-orientation`.
- Set `aria-label` when a semantic separator needs an accessible name; separator
  roles do not derive their name from children.

Avoid using Divider as layout spacing alone. Use layout gap or margin when no
visible or semantic boundary is intended.

Read `references/full-docs.md` for all props, examples, slots, data attributes,
and type definitions.

## Source

- Docs: `apps/docs/docs/components/divider.mdx`
- Component: `packages/react-spar/src/components/divider/`

---
name: takeoff-timeline
description:
  Use the Timeline component from @takeoff-ui/react-spar to show a read-only
  sequence of events along a horizontal or vertical line, with alternating or
  one-sided content and optional icon indicators. Use whenever building,
  importing, styling, or fixing a timeline, history, activity log, milestone
  list, or event track in a Takeoff / Spar React app.
---

# Timeline — @takeoff-ui/react-spar

Use `Timeline` to lay out events in order along a line. It is a standalone
Takeoff component rather than a Spar primitive: a semantic `<ol>` with one
`<li>` per event, laid out entirely in CSS. It has no state and no keyboard
behavior.

**When to use:** Release histories, order or flight tracking, audit trails, and
milestone lists — anything read as "this happened, then this". Not this — use
`takeoff-stepper` when the user moves through the steps of a flow.

## Quick start

```tsx
import { Timeline } from '@takeoff-ui/react-spar';

<Timeline aria-label="Release history">
  <Timeline.Item>
    <Timeline.Title>First Commit</Timeline.Title>
    <Timeline.Time dateTime="2024-07-07">07.07.2024</Timeline.Time>
  </Timeline.Item>
  <Timeline.Item>
    <Timeline.Title>Prod</Timeline.Title>
    <Timeline.Description>Live release</Timeline.Description>
    <Timeline.Time dateTime="2024-12-16">16.12.2024</Timeline.Time>
  </Timeline.Item>
</Timeline>;
```

## Anatomy

```tsx
<Timeline>
  <Timeline.Item>
    <Timeline.Title />
    <Timeline.Description />
    <Timeline.Time />
  </Timeline.Item>
</Timeline>
```

The dot and the connecting line are internal slots of `Timeline.Item`
(`separator`, `indicator`, `connector`); the item's children render in its
`content` slot, so any node (a `Button`, an image) can sit beside the parts.

## Common patterns

```tsx
// From data: map an array to items.
<Timeline orientation="vertical" aria-label="Order status">
  {events.map(event => (
    <Timeline.Item key={event.id}>
      <Timeline.Title>{event.title}</Timeline.Title>
      <Timeline.Time dateTime={event.iso}>{event.label}</Timeline.Time>
    </Timeline.Item>
  ))}
</Timeline>

// Everything on one side of the line.
<Timeline orientation="vertical" placement="end">…</Timeline>

// An icon instead of the dot.
<Timeline.Item indicator={<AirplaneIconFilledRounded />}>…</Timeline.Item>

// A heading title.
<Timeline.Title as="h3">Launch</Timeline.Title>
```

## Key props

| Prop          | Part            | Type                              | Default                      | Notes                                                                       |
| ------------- | --------------- | --------------------------------- | ---------------------------- | --------------------------------------------------------------------------- |
| `orientation` | `Timeline`      | `'horizontal' \| 'vertical'`      | `'horizontal'`               | Axis of the line.                                                           |
| `placement`   | `Timeline`      | `'alternate' \| 'start' \| 'end'` | `'alternate'`                | Side of the line content sits on; `alternate` starts after it and switches. |
| `indicator`   | `Timeline.Item` | `ReactNode`                       | —                            | Replaces the default dot (typically an icon); decorative.                   |
| `dateTime`    | `Timeline.Time` | `string`                          | —                            | Native `<time>` attribute for the machine-readable value.                   |
| `as`          | every part      | `ElementType`                     | `ol` / `li` / `div` / `time` | Override the root's and items' `as` together to keep valid markup.          |
| `classNames`  | every part      | `Partial<Record<Slot, string>>`   | —                            | Item slots: `root`, `separator`, `indicator`, `connector`, `content`.       |
| `slotProps`   | every part      | `SlotPropsMap<Slot>`              | —                            | Per-slot HTML attributes and styles.                                        |

## v1 migration

`TkTimeline` / `TkTimelineItem` map to this compound. `items` becomes mapped
`Timeline.Item` children (`title` → `Timeline.Title`, `description` →
`Timeline.Description`, `date` → `Timeline.Time`); `alternate={false}` becomes
`placement="end"`. Slotted `TkTimelineItem` content goes straight into
`Timeline.Item`.

## Accessibility

- Give the list a name with `aria-label` or `aria-labelledby`.
- The separator (dot, icon, line) is `aria-hidden`; put meaning in text, not in
  the indicator's color or icon alone.
- Use `Timeline.Time` with `dateTime` so dates are machine-readable.

Read `references/full-docs.md` for all props, examples, slots, data attributes,
and type definitions.

## Source

- Docs: `apps/docs/docs/components/timeline.mdx`
- Component: `packages/react-spar/src/components/timeline/`

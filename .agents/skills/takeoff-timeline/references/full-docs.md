# Timeline

`Timeline` shows a sequence of events along a line. It is a standalone component
(no upstream Spar primitive) that renders a semantic ordered list — `<ol>` with
one `<li>` per event — and lays everything out in CSS: there is no state,
keyboard handling, or item registration. The line, the dots and the connectors
are decorative and hidden from assistive technology.

## Usage

```tsx
import { Timeline } from '@takeoff-ui/react-spar';
```

```tsx
<Timeline>
  <Timeline.Item>
    <Timeline.Title />
    <Timeline.Description />
    <Timeline.Time />
  </Timeline.Item>
</Timeline>
```

Give the list an accessible name with `aria-label` or `aria-labelledby`. To
render from data, map an array to `Timeline.Item`s.

## Playground

```tsx
const events = [
  { title: 'First Commit', date: '2024-07-07', label: '07.07.2024' },
  {
    title: 'Prod',
    description: 'Live release',
    date: '2024-12-16',
    label: '16.12.2024',
  },
  {
    title: 'Open Source',
    description: 'Open source release',
    date: '2025-04-12',
    label: '12.04.2025',
  },
];

function PlaygroundDemo() {
  return (
    <Timeline aria-label="Release history">
      {events.map(event => (
        <Timeline.Item key={event.title}>
          <Timeline.Title>{event.title}</Timeline.Title>
          {event.description && (
            <Timeline.Description>{event.description}</Timeline.Description>
          )}
          <Timeline.Time dateTime={event.date}>{event.label}</Timeline.Time>
        </Timeline.Item>
      ))}
    </Timeline>
  );
}

render(<PlaygroundDemo />);
```

## Orientation

Timelines are horizontal by default. Set `orientation="vertical"` to stack the
events; the line then runs down the middle.

```tsx
function OrientationDemo() {
  return (
    <Timeline orientation="vertical" aria-label="Release history">
      <Timeline.Item>
        <Timeline.Title>First Commit</Timeline.Title>
        <Timeline.Time dateTime="2024-07-07">07.07.2024</Timeline.Time>
      </Timeline.Item>
      <Timeline.Item>
        <Timeline.Title>Prod</Timeline.Title>
        <Timeline.Description>Live release</Timeline.Description>
        <Timeline.Time dateTime="2024-12-16">16.12.2024</Timeline.Time>
      </Timeline.Item>
      <Timeline.Item>
        <Timeline.Title>Open Source</Timeline.Title>
        <Timeline.Description>Open source release</Timeline.Description>
        <Timeline.Time dateTime="2025-04-12">12.04.2025</Timeline.Time>
      </Timeline.Item>
    </Timeline>
  );
}

render(<OrientationDemo />);
```

## Placement

`placement` decides which side of the line the content sits on. `alternate` (the
default) puts the first event after the line and switches sides from there;
`start` and `end` keep every event on one side. In a vertical timeline `start`
is the inline start (left in LTR); in a horizontal one it is above the line.

```tsx
const steps = [
  { title: 'Check-in', time: '09:10' },
  { title: 'Boarding', time: '10:05' },
  { title: 'Departure', time: '10:40' },
];

function PlacementDemo() {
  return (
    <div className="grid w-full gap-8 sm:grid-cols-3">
      {['alternate', 'start', 'end'].map(placement => (
        <div key={placement}>
          <p className="mb-2 text-sm font-semibold">{placement}</p>
          <Timeline
            orientation="vertical"
            placement={placement}
            aria-label={placement + ' timeline'}
          >
            {steps.map(step => (
              <Timeline.Item key={step.title}>
                <Timeline.Title>{step.title}</Timeline.Title>
                <Timeline.Time>{step.time}</Timeline.Time>
              </Timeline.Item>
            ))}
          </Timeline>
        </div>
      ))}
    </div>
  );
}

render(<PlacementDemo />);
```

## Indicator

Pass `indicator` to an item to replace the dot, typically with an icon. It is
drawn in the primary color and stays decorative.

```tsx
function IndicatorDemo() {
  return (
    <Timeline orientation="vertical" placement="end" aria-label="Flight TK1923">
      <Timeline.Item indicator={<CheckCircleIconFilledRounded />}>
        <Timeline.Title>Booked</Timeline.Title>
        <Timeline.Time dateTime="2025-05-02">2 May 2025</Timeline.Time>
      </Timeline.Item>
      <Timeline.Item indicator={<AirplaneIconFilledRounded />}>
        <Timeline.Title>Departed Istanbul</Timeline.Title>
        <Timeline.Description>Gate F4, on time</Timeline.Description>
        <Timeline.Time dateTime="2025-05-10T10:40">
          10 May 2025, 10:40
        </Timeline.Time>
      </Timeline.Item>
      <Timeline.Item indicator={<FlagIconFilledRounded />}>
        <Timeline.Title>Arrived London</Timeline.Title>
        <Timeline.Time dateTime="2025-05-10T12:55">
          10 May 2025, 12:55
        </Timeline.Time>
      </Timeline.Item>
    </Timeline>
  );
}

render(<IndicatorDemo />);
```

## Custom content

An item renders any children. `Timeline.Title`, `Timeline.Description` and
`Timeline.Time` carry the Takeoff typography; use `as` to make a title a
heading, and place other nodes such as buttons beside them.

```tsx
function CustomContentDemo() {
  return (
    <Timeline orientation="vertical" aria-label="Project milestones">
      <Timeline.Item>
        <Timeline.Title as="h3">Design review</Timeline.Title>
        <Timeline.Description>
          Approved with <strong>two</strong> follow-ups.
        </Timeline.Description>
      </Timeline.Item>
      <Timeline.Item>
        <Timeline.Title as="h3">Beta</Timeline.Title>
        <Timeline.Description>Rolled out to 5% of users.</Timeline.Description>
        <div className="mt-2">
          <Button size="small" appearance="outlined">
            View report
          </Button>
        </div>
      </Timeline.Item>
      <Timeline.Item>
        <Timeline.Title as="h3" style={{ color: 'var(--primary-base)' }}>
          General availability
        </Timeline.Title>
      </Timeline.Item>
    </Timeline>
  );
}

render(<CustomContentDemo />);
```

## API Reference

### Timeline {#timeline}

#### Props {#timeline-props}

| Name        | Type                                                         | Default      | Description                                                                          |
| ----------- | ------------------------------------------------------------ | ------------ | ------------------------------------------------------------------------------------ |
| children    | `React.ReactNode`                                            | -            | `Timeline.Item` elements. Alternating sides follow each item’s position in the list. |
| orientation | `TimelineOrientation`                                        | 'horizontal' | Layout axis of the timeline line.                                                    |
| placement   | `TimelinePlacement`                                          | 'alternate'  | Which side of the line item content sits on.                                         |
| classNames  | `Partial<Record<"root", string>>`                            | -            | Per-slot class name overrides.                                                       |
| slotProps   | `Partial<Record<"root", React.HTMLAttributes<HTMLElement>>>` | -            | Per-slot HTML attribute overrides.                                                   |
| className   | `string`                                                     | -            | Appends custom classes to the root slot of this part.                                |

#### Data attributes {#timeline-data-attributes}

| Attribute        | Applied when | Purpose                                                                                                                  |
| ---------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------ |
| data-slot="root" | Always       | Stable selector for wrapper styling on the root slot.                                                                    |
| data-orientation | Always       | Reflects the resolved `orientation` prop (`horizontal` \| `vertical`).                                                   |
| data-placement   | Always       | Reflects the resolved `placement` prop (`alternate` \| `start` \| `end`); the recipe alternates sides with `:nth-child`. |

### Timeline.Item {#timeline-item}

#### Props {#timeline-item-props}

| Name       | Type                                                                   | Default | Description                                                                                                                                     |
| ---------- | ---------------------------------------------------------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| children   | `React.ReactNode`                                                      | -       | Event content — typically `Timeline.Title`, `Timeline.Description` and `Timeline.Time`, plus any other node. Renders inside the `content` slot. |
| indicator  | `React.ReactNode`                                                      | -       | Custom indicator content, replacing the default dot — typically an icon. Rendered inside the decorative, `aria-hidden` separator.               |
| classNames | `Partial<Record<TimelineItemSlot, string>>`                            | -       | Per-slot class name overrides.                                                                                                                  |
| slotProps  | `Partial<Record<TimelineItemSlot, React.HTMLAttributes<HTMLElement>>>` | -       | Per-slot HTML attribute overrides.                                                                                                              |
| className  | `string`                                                               | -       | Appends custom classes to the root slot of this part.                                                                                           |

#### Data attributes {#timeline-item-data-attributes}

| Attribute             | Applied when | Purpose                                                                                                       |
| --------------------- | ------------ | ------------------------------------------------------------------------------------------------------------- |
| data-slot="root"      | Always       | Stable selector for wrapper styling on the root slot.                                                         |
| data-slot="separator" | Always       | The `aria-hidden` column (vertical) or row (horizontal) holding the indicator and the connector.              |
| data-slot="indicator" | Always       | The point on the line. Empty by default (the recipe paints the dot); holds the `indicator` content otherwise. |
| data-slot="connector" | Always       | The line to the next item; hidden on the last item.                                                           |
| data-slot="content"   | Always       | The box the item’s children render in.                                                                        |

### Timeline.Title {#timeline-title}

#### Data attributes {#timeline-title-data-attributes}

| Attribute        | Applied when | Purpose                                               |
| ---------------- | ------------ | ----------------------------------------------------- |
| data-slot="root" | Always       | Stable selector for wrapper styling on the root slot. |

### Timeline.Description {#timeline-description}

#### Data attributes {#timeline-description-data-attributes}

| Attribute        | Applied when | Purpose                                               |
| ---------------- | ------------ | ----------------------------------------------------- |
| data-slot="root" | Always       | Stable selector for wrapper styling on the root slot. |

### Timeline.Time {#timeline-time}

#### Data attributes {#timeline-time-data-attributes}

| Attribute        | Applied when | Purpose                                               |
| ---------------- | ------------ | ----------------------------------------------------- |
| data-slot="root" | Always       | Stable selector for wrapper styling on the root slot. |

### Type Definitions {#timeline-type-definitions}

| Name                | Definition                                                         |
| ------------------- | ------------------------------------------------------------------ |
| TimelineOrientation | `'horizontal' \| 'vertical'`                                       |
| TimelinePlacement   | `'alternate' \| 'start' \| 'end'`                                  |
| TimelineItemSlot    | `'root' \| 'separator' \| 'indicator' \| 'connector' \| 'content'` |

## When to use

Release histories, order or flight tracking, audit trails, and milestone lists —
anything read as "this happened, then this". Not this — use `takeoff-stepper`
when the user moves through the steps of a flow.

## Accessibility

- Give the list a name with `aria-label` or `aria-labelledby`.
- The separator (dot, icon, line) is `aria-hidden`; put meaning in text, not in
  the indicator's color or icon alone.
- Use `Timeline.Time` with `dateTime` so dates are machine-readable.

Read `references/full-docs.md` for all props, examples, slots, data attributes,
and type definitions.

---
name: takeoff-progress
description:
  Use the compound Progress component from @takeoff-ui/react-spar to show
  determinate or indeterminate task completion as a linear bar or circular ring.
  Use whenever building, importing, styling, or fixing progress bars, progress
  rings, upload/download completion, step completion, percentages, or loading
  progress in a Takeoff / Spar React app.
---

# Progress — @takeoff-ui/react-spar

Use `Progress` when work has measurable completion or when an ongoing process
needs an indeterminate progress treatment.

**When to use:** Work with a known percentage — file uploads, imports, quota and
storage meters, multi-item batch jobs — or a bar-shaped indeterminate treatment
for a long-running task. Not this — use `takeoff-spinner` for short waits where
a bar would be visual noise, and `takeoff-skeleton` when you are holding the
shape of content that is still loading.

## Quick start

```tsx
import { Progress } from '@takeoff-ui/react-spar';

<Progress value={68} aria-label="Upload progress">
  <Progress.Track>
    <Progress.Indicator />
  </Progress.Track>
  <Progress.Value>68%</Progress.Value>
</Progress>;
```

## Common patterns

```tsx
<Progress value={42} variant="success">
  <Progress.Track>
    <Progress.Indicator />
  </Progress.Track>
  <Progress.Value>42%</Progress.Value>
</Progress>

<Progress appearance="circular" value={75} size="large">
  <Progress.Track><Progress.Indicator /></Progress.Track>
  <Progress.Value>75%</Progress.Value>
</Progress>

<Progress indeterminate aria-label="Preparing download">
  <Progress.Track><Progress.Indicator /></Progress.Track>
</Progress>
```

Children are optional. Omitting them renders the default track and indicator;
compose the parts explicitly when a visible value or slot customization is
needed.

## Field integration

```tsx
import { Field, Progress } from '@takeoff-ui/react-spar';

<Field>
  <Field.Label>Uploading documents</Field.Label>
  <Progress value={uploaded} max={total}>
    <Progress.Track />
    <Progress.Value>{`${uploaded} of ${total}`}</Progress.Value>
  </Progress>
</Field>;
```

`Field.Label` automatically supplies `aria-labelledby`. A disabled Field also
passes its disabled state to Progress.

## Range and completion

- Values are clamped to `[min, max]`; non-finite values resolve safely.
- `indeterminate` takes precedence over `value` and removes `aria-valuenow`.
- `data-complete` is emitted when the clamped value reaches `max`.
- Use `aria-valuetext` for domain units such as “3 of 10 steps” or “42 MB”.

```tsx
<Progress
  value={3}
  min={0}
  max={10}
  aria-label="Profile setup"
  aria-valuetext="3 of 10 steps"
/>
```

## Key props

| Prop                      | Type                                                        | Default     | Notes                                |
| ------------------------- | ----------------------------------------------------------- | ----------- | ------------------------------------ |
| `value`                   | `number`                                                    | `0`         | Clamped determinate value.           |
| `min` / `max`             | `number`                                                    | `0` / `100` | Numeric range.                       |
| `indeterminate`           | `boolean`                                                   | `false`     | Unknown-duration progress.           |
| `appearance`              | `'linear' \| 'circular'`                                    | `'linear'`  | Bar or ring.                         |
| `size`                    | `'small' \| 'base' \| 'large'`                              | `'base'`    | Track/ring scale.                    |
| `variant`                 | `'primary' \| 'info' \| 'success' \| 'danger' \| 'warning'` | `'primary'` | Fill color.                          |
| `disabled`                | `boolean`                                                   | `false`     | Muted state; may inherit from Field. |
| `Progress.Value children` | `ReactNode`                                                 | —           | Consumer-formatted visible value.    |

## Accessibility

- The root owns `role="progressbar"`, range ARIA, and the accessible value.
- Track, indicator, and visible value are decorative to assistive technology.
- Outside a labelled Field, provide `aria-label` or `aria-labelledby`. The root
  otherwise falls back to the generic accessible name `"Progress"`.
- Reduced-motion preferences disable the determinate transition and slow the
  indeterminate sweep.
- Use `Spinner`, not Progress, for a compact unknown-duration activity without
  meaningful progressbar context.

Read `references/full-docs.md` for sections, defaults, all props, slots, data
attributes, accessibility, and type definitions.

## Source

- Docs: `apps/docs/docs/components/progress.mdx`
- Component: `packages/react-spar/src/components/progress/`

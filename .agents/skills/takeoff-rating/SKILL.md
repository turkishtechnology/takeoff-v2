---
name: takeoff-rating
description:
  Use the Rating component from @takeoff-ui/react-spar to let people pick a
  score from a row of stars, hearts, dots or numbered boxes, or to show an
  average (half values) read-only. Use whenever building, importing, styling or
  fixing star ratings, review scores, satisfaction or NPS-style pickers,
  feedback forms or score displays in a Takeoff / Spar React app.
---

# Rating — @takeoff-ui/react-spar

`Rating` is a single-choice score control: the root is a Spar radiogroup and
every score a radio, so keyboard, focus, form submission and `Field` wiring come
from Spar's `Radio`. Without children the root renders `max` items itself.

**When to use:** Review and satisfaction scores, feedback forms, showing an
average score. Not this — use `takeoff-slider` for a continuous range and
`takeoff-radio` when the options are labelled choices rather than a scale.

## Setup

Requires the Takeoff provider + token CSS mounted once at the app root (see the
`takeoff-ui` skill). Then:

```tsx
import { Rating } from '@takeoff-ui/react-spar';
```

## Compound parts

- `Rating` — root; renders `role="radiogroup"` and, without children, `max`
  default items.
- `Rating.Item` — one score (`value` is a whole number); `role="radio"` named
  from `itemLabel`. Children replace the default glyph.

## Basic usage

```tsx
<Rating aria-label="Score" defaultValue={3} />

<Field>
  <Field.Label>Rate your flight</Field.Label>
  <Rating name="score" value={score} onValueChange={setScore} />
</Field>
```

## Examples

### Types, max and value text

```tsx
<Rating aria-label="Score" type="heart" />
<Rating aria-label="Score" type="dot" />
<Rating aria-label="Score" type="number" max={10} />
<Rating aria-label="Score" max={10} showValue />
```

`type="number"` renders numbered boxes that take a red-to-green colour when
picked; `showValue` prints the zero-padded score under each glyph (no effect on
numbered boxes).

### Half values (display only)

```tsx
<Rating aria-label="Average rating, 3.5 of 5" value={3.5} readOnly />
```

A fractional value draws a half fill on the next item, but no item reads as
checked and nothing is submitted; picking always yields a whole score.

### Custom items

```tsx
<Rating aria-label="Mood" defaultValue={2} itemLabel="{value} of {max} moods">
  {['😞', '😐', '🙂'].map((emoji, index) => (
    <Rating.Item key={emoji} value={index + 1}>
      {({ fill }) => (
        <span style={{ opacity: fill === 'empty' ? 0.35 : 1 }}>{emoji}</span>
      )}
    </Rating.Item>
  ))}
</Rating>
```

## Key props

### `Rating` (root)

| Prop            | Type                                     | Default              | Notes                                                               |
| --------------- | ---------------------------------------- | -------------------- | ------------------------------------------------------------------- |
| `value`         | `number`                                 | -                    | Controlled score; fractional values are display-only.               |
| `defaultValue`  | `number`                                 | -                    | Uncontrolled initial score.                                         |
| `onValueChange` | `(value: number) => void`                | -                    | Fires with the picked whole score, once per change.                 |
| `max`           | `number`                                 | `5`                  | Number of default items.                                            |
| `type`          | `'star' \| 'heart' \| 'dot' \| 'number'` | `'star'`             | Glyph per item.                                                     |
| `showValue`     | `boolean`                                | `false`              | Zero-padded score under each glyph.                                 |
| `itemLabel`     | `string`                                 | `'{value} of {max}'` | Item accessible-name template; empty falls back to the default.     |
| `name`          | `string`                                 | -                    | Form field name; the score is submitted as a string.                |
| `disabled`      | `boolean`                                | `false`              | Greys out and blocks picking; inherited from `Field`.               |
| `readOnly`      | `boolean`                                | `false`              | Focusable and announced, but cannot change; inherited from `Field`. |
| `required`      | `boolean`                                | `false`              | Native radio validation; inherited from `Field`.                    |
| `invalid`       | `boolean`                                | `false`              | Sets `aria-invalid`; inherited from `Field`.                        |
| `autoFocus`     | `boolean`                                | `false`              | Focus the picked (or first) item on mount.                          |
| `onKeyDown`     | `KeyboardEventHandler`                   | -                    | Runs before the arrow-key handling; `preventDefault()` vetoes it.   |

### `Rating.Item`

| Prop       | Type                                                | Default | Notes                                     |
| ---------- | --------------------------------------------------- | ------- | ----------------------------------------- |
| `value`    | `number`                                            | -       | Required whole score.                     |
| `disabled` | `boolean`                                           | `false` | Skips this item for pointer and keyboard. |
| `children` | `ReactNode \| ({ value, fill, isChecked }) => node` | glyph   | `fill` is `'full' \| 'half' \| 'empty'`.  |

## Styling hooks

Root: `data-type`, plus Spar's `data-disabled` / `data-readonly` /
`data-invalid`. Item: `data-fill`, `data-level` (number type, 1–5) and Spar's
`data-state="checked"`. Internal slots `icon` and `value` take `classNames` /
`slotProps`. The hover preview is pure CSS.

## Accessibility

- Name the group with `aria-label` or a `Field.Label`; items are named from
  `itemLabel`, glyphs are `aria-hidden`.
- Arrow keys move and pick, Home / End jump to the ends, Tab leaves the group.
- For a read-only average, put the exact value in the group's accessible name.

Read `references/full-docs.md` for the full docs page.

## Source

- Docs: `apps/docs/docs/components/rating.mdx`
- Component: `packages/react-spar/src/components/rating/`

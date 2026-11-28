# Rating

`Rating` lets people pick a whole score from a row of stars, hearts, dots or
numbered boxes. It is a radio group underneath: the root is a
`role="radiogroup"` and every score is a `role="radio"`, so keyboard, focus,
form submission and `Field` wiring come from Spar's `Radio`.

Without children the root renders `max` items on its own, so `<Rating />` is the
whole anatomy in most screens. Compose `Rating.Item`s when a score needs custom
content.

## Usage

```tsx
import { Field, Rating } from '@takeoff-ui/react-spar';
```

```tsx
<Rating aria-label="Score" defaultValue={3} />

<Field>
  <Field.Label>Rate your flight</Field.Label>
  <Rating name="score" value={score} onValueChange={setScore} />
</Field>

<Rating aria-label="Score">
  <Rating.Item value={1} />
  <Rating.Item value={2} />
</Rating>
```

## Playground

```tsx
function PlaygroundDemo() {
  const [score, setScore] = React.useState(3);

  return (
    <Field>
      <Field.Label>Rate your flight</Field.Label>
      <Rating value={score} onValueChange={setScore} showValue />
      <Field.Description>{'You picked ' + score + ' of 5.'}</Field.Description>
    </Field>
  );
}

render(<PlaygroundDemo />);
```

## Types

`type` picks the glyph: `star` (default), `heart`, `dot`, or `number` for
numbered boxes that take a red-to-green colour as they are picked.

```tsx
<div className="flex flex-col items-start gap-6">
  <Rating aria-label="Star rating" type="star" defaultValue={3} />
  <Rating aria-label="Heart rating" type="heart" defaultValue={3} />
  <Rating aria-label="Dot rating" type="dot" defaultValue={3} />
  <Rating aria-label="Number rating" type="number" defaultValue={3} />
</div>
```

## Max and value text

`max` sets how many items the root renders (default `5`). `showValue` prints the
zero-padded score under each glyph; numbered boxes already show theirs.

```tsx
<div className="flex flex-col items-start gap-6">
  <Rating aria-label="Score out of 10" max={10} defaultValue={7} showValue />
  <Rating
    aria-label="Number score out of 10"
    type="number"
    max={10}
    defaultValue={8}
  />
</div>
```

## Half values

A fractional `value` (e.g. an average of `3.5`) draws a half fill on the next
item. Half values are display-only: no item reads as checked, nothing is
submitted, and picking always yields a whole score — so pair them with
`readOnly` and put the exact value in the accessible name.

```tsx
<div className="flex flex-col items-start gap-6">
  <Rating aria-label="Average rating, 3.5 of 5" value={3.5} readOnly />
  <Rating
    aria-label="Average rating, 2.5 of 5"
    type="heart"
    value={2.5}
    readOnly
  />
</div>
```

## Read-only and disabled

`readOnly` keeps the rating focusable and its value announced, but blocks
changes and the hover preview. `disabled` greys every item out and takes the
group out of the tab order. Both are inherited from a surrounding `Field`.

```tsx
<div className="flex flex-col items-start gap-6">
  <Field readOnly>
    <Field.Label>Read-only</Field.Label>
    <Rating defaultValue={4} />
  </Field>
  <Field disabled>
    <Field.Label>Disabled</Field.Label>
    <Rating defaultValue={4} />
  </Field>
</div>
```

## Forms

Give the rating a `name` and the picked score is submitted with the form as a
string (`"4"`). `required` (own or from a `Field`) uses native radio validation.

```tsx
function FormDemo() {
  const [submitted, setSubmitted] = React.useState(null);

  return (
    <form
      className="flex flex-col items-start gap-4"
      onSubmit={event => {
        event.preventDefault();
        setSubmitted(new FormData(event.currentTarget).get('score'));
      }}
    >
      <Field required>
        <Field.Label>Overall score</Field.Label>
        <Rating name="score" />
      </Field>
      <Button type="submit">Submit</Button>
      <output>
        {submitted === null ? 'Nothing submitted yet' : 'score = ' + submitted}
      </output>
    </form>
  );
}

render(<FormDemo />);
```

## Custom items

Children replace the default glyph. A function child receives the item's `fill`
(`'full' | 'half' | 'empty'`), `isChecked` and `value`.

```tsx
<Rating aria-label="Mood" defaultValue={2} itemLabel="{value} of {max} moods">
  {['😞', '😐', '🙂', '😄'].map((emoji, index) => (
    <Rating.Item key={emoji} value={index + 1}>
      {({ fill }) => (
        <span style={{ fontSize: 24, opacity: fill === 'empty' ? 0.35 : 1 }}>
          {emoji}
        </span>
      )}
    </Rating.Item>
  ))}
</Rating>
```

## Accessibility

- The root is a `role="radiogroup"`; name it with `aria-label` or a
  `Field.Label`. Each item is a `role="radio"` named from `itemLabel` (default
  `"{value} of {max}"`), so the glyphs themselves stay `aria-hidden`.
- Arrow keys move and pick the score, Home and End jump to the first and last
  item, and Tab leaves the group (roving tabindex).
- `readOnly` exposes `aria-readonly` on the group; `disabled`, `required` and
  `invalid` map to their ARIA counterparts and inherit from `Field`.
- The hover preview is CSS only, so pointer movement never changes the value or
  what assistive technology announces.

## API Reference

### Rating {#rating}

#### Props {#rating-props}

| Name         | Type                                                         | Default            | Description                                                                                                                                                                          |
| ------------ | ------------------------------------------------------------ | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| children     | `React.ReactNode`                                            | -                  | `Rating.Item`s for custom content. When omitted, the root renders `max` default items.                                                                                               |
| value        | `number`                                                     | -                  | Controlled score. A fractional value (e.g. `3.5`) is display-only: it draws a half fill, but no item reads as checked and nothing is submitted.                                      |
| defaultValue | `number`                                                     | -                  | Uncontrolled initial score. Same fractional rule as `value`.                                                                                                                         |
| max          | `number`                                                     | 5                  | Number of items rendered when the root has no children.                                                                                                                              |
| type         | `RatingType`                                                 | 'star'             | Glyph drawn for each item.                                                                                                                                                           |
| showValue    | `boolean`                                                    | false              | Prints the zero-padded score under each glyph. Number items already show their score, so it has no effect on `type="number"`.                                                        |
| itemLabel    | `string`                                                     | '{value} of {max}' | Accessible-name template for each item. `{value}` and `{max}` are replaced; an empty string falls back to the default.                                                               |
| classNames   | `Partial<Record<"root", string>>`                            | -                  | Per-slot class name overrides.                                                                                                                                                       |
| slotProps    | `Partial<Record<"root", React.HTMLAttributes<HTMLElement>>>` | -                  | Per-slot HTML attribute overrides.                                                                                                                                                   |
| autoFocus    | `boolean`                                                    | false              | Whether to focus the first focusable radio item on mount                                                                                                                             |
| id           | `string`                                                     | -                  | Custom base ID used for generating the form `name` attribute. If not provided, one will be generated automatically.                                                                  |
| disabled     | `boolean`                                                    | false              | Disables entire radio group                                                                                                                                                          |
| name         | `string`                                                     | -                  | HTML name attribute for form submission                                                                                                                                              |
| readOnly     | `boolean`                                                    | false              | Read-only state. A read-only radio group can be inspected but its value cannot change. When inside a `<Field>`, inherited automatically.                                             |
| required     | `boolean`                                                    | false              | Marks group as required for form validation                                                                                                                                          |
| invalid      | `boolean`                                                    | false              | Marks the group as invalid for ARIA wiring (`aria-invalid`). When nested inside a `<Field>` with `invalid`, this is inherited automatically; a direct prop on `<Radio>` always wins. |
| className    | `string`                                                     | -                  | Appends custom classes to the root slot of this part.                                                                                                                                |

#### Events {#rating-events}

| Name          | Type                                | Default | Description                                                                                                                          |
| ------------- | ----------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| onValueChange | `(value: number) => void`           | -       | Called with the picked score (always a whole number).                                                                                |
| onKeyDown     | `KeyboardEventHandler<HTMLElement>` | -       | Native keydown handler on the radiogroup root. Runs before Spar's Arrow / Home / End navigation; `event.preventDefault()` vetoes it. |

#### Data attributes {#rating-data-attributes}

| Attribute        | Applied when                                                | Purpose                                                                                                      |
| ---------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| data-slot="root" | Always                                                      | Stable selector for wrapper styling on the root slot.                                                        |
| data-type        | Always                                                      | Reflects the resolved `type` (`star` \| `heart` \| `dot` \| `number`) so the recipe picks the glyph colours. |
| data-disabled    | disabled (own prop or inherited from a surrounding `Field`) | Greys every item out and turns the hover preview off (Spar-emitted).                                         |
| data-readonly    | readOnly (own prop or inherited from a surrounding `Field`) | Turns the hover preview off; the value stays inspectable (Spar-emitted).                                     |
| data-invalid     | invalid (own prop or inherited from a surrounding `Field`)  | Mirrors `aria-invalid` for styling (Spar-emitted).                                                           |

### Rating.Item {#rating-item}

#### Props {#rating-item-props}

| Name       | Type                                                                     | Default | Description                                                                                         |
| ---------- | ------------------------------------------------------------------------ | ------- | --------------------------------------------------------------------------------------------------- |
| children   | `React.ReactNode \| ((state: RatingItemRenderProps) => React.ReactNode)` | -       | Replaces the default glyph and value text. The function form receives `{ value, fill, isChecked }`. |
| value      | `number`                                                                 | -       | The whole score this item stands for.                                                               |
| classNames | `Partial<Record<RatingItemSlot, string>>`                                | -       | Per-slot class name overrides — `root` plus the internal `icon` / `value` slots.                    |
| slotProps  | `Partial<Record<RatingItemSlot, React.HTMLAttributes<HTMLElement>>>`     | -       | Per-slot HTML attribute overrides — `root` plus the internal `icon` / `value` slots.                |
| disabled   | `boolean`                                                                | false   | Disables this specific radio item                                                                   |
| className  | `string`                                                                 | -       | Appends custom classes to the root slot of this part.                                               |

#### Data attributes {#rating-item-data-attributes}

| Attribute         | Applied when                | Purpose                                                                                                      |
| ----------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------ |
| data-slot="root"  | Always                      | Stable selector for wrapper styling on the root slot.                                                        |
| data-slot="icon"  | Default content             | The decorative glyph (or the number for `type="number"`); style it via `classNames.icon` / `slotProps.icon`. |
| data-slot="value" | `showValue` on a glyph type | The zero-padded score under the glyph; style it via `classNames.value` / `slotProps.value`.                  |
| data-fill         | Always                      | `full` up to the value, `half` on the next item for a fractional part of .5 or more, `empty` after.          |
| data-level        | `type="number"`             | The score bucketed into five steps (1–5) for the red-to-green colour scale.                                  |
| data-state        | Always                      | `checked` on the picked score, `unchecked` otherwise (Spar-emitted).                                         |

### Type Definitions {#rating-type-definitions}

| Name                  | Definition                                                |
| --------------------- | --------------------------------------------------------- |
| RatingType            | `'star' \| 'heart' \| 'dot' \| 'number'`                  |
| RatingItemRenderProps | `{ value: number; fill: RatingFill; isChecked: boolean }` |
| RatingItemSlot        | `'root' \| 'icon' \| 'value'`                             |

## When to use

Review and satisfaction scores, feedback forms, showing an average score. Not
this — use `takeoff-slider` for a continuous range and `takeoff-radio` when the
options are labelled choices rather than a scale.

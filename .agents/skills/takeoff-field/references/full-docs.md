# Field — @takeoff-ui/react-spar

> **Field has no standalone Copy-page doc.** It is documented inside the **Forms
> guides**. See:
> https://takeoff-v2.app.turkishtechlab.com/docs/forms/react-hook-form and:
> https://takeoff-v2.app.turkishtechlab.com/docs/forms/tanstack-form

`Field` is the form-field wrapper from Takeoff UI / Spar React. It provides the
shared ARIA context (label association, description / `aria-describedby`, error
`role="alert"`, and `invalid` / `disabled` / `required` / `readOnly` state) for
a single nested control — `Input`, `Switch`, `Checkbox`, `Radio`, `Select`, etc.
— plus styled label, helper-text, and error-message slots that match the design
system's field anatomy.

Wrap **one** control per `Field`. Drive its visual + a11y state from your form
library's field state (e.g. `fieldState.invalid` in React Hook Form, validation
state in TanStack Form).

## Import

```tsx
import { Field } from '@takeoff-ui/react-spar';
```

`Field` is a compound component (`Object.assign`); the sub-parts are attached as
static properties — there are no separate named exports for them.

## Compound parts

| Part                 | Element | Purpose                                                                                                                                                                  |
| -------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Field`              | `div`   | Root. Holds form/a11y state and provides Field context to nested control + parts.                                                                                        |
| `Field.Label`        | `label` | Visible label. `htmlFor` is wired automatically by Spar's Field context. Auto-renders a `*` asterisk (`.tk-field-asterisk`, `aria-hidden`) when the Field is `required`. |
| `Field.Description`  | `div`   | Helper / hint text. Wired into `aria-describedby`. Auto-renders a leading decorative info icon when it has content.                                                      |
| `Field.ErrorMessage` | `div`   | Error text. Rendered with `role="alert"` by Spar. Auto-renders a leading decorative error icon when it has content.                                                      |

> The asterisk, info icon, and error icon are wrapper-owned conventions rendered
> automatically and hidden from assistive tech (`aria-hidden`). The icons are
> gated on the part having content, so an empty description / error never paints
> a lone icon.

## Usage

### Basic (label + control + description)

```tsx
import { Field, Input } from '@takeoff-ui/react-spar';

<Field>
  <Field.Label>Request title</Field.Label>
  <Input>
    <Input.Field placeholder="Change return flight" autoComplete="off" />
  </Input>
  <Field.Description>Use a short, specific title.</Field.Description>
</Field>;
```

### Required + invalid state with error message

Show `Field.ErrorMessage` when invalid, otherwise show `Field.Description`. Pass
the visual validation flag to `Field invalid` and to the control's
`aria-invalid`.

```tsx
import { Field, Input } from '@takeoff-ui/react-spar';

<Field invalid={isInvalid} required>
  <Field.Label>Request title</Field.Label>
  <Input>
    <Input.Field aria-invalid={isInvalid} placeholder="Change return flight" />
  </Input>
  {isInvalid ? (
    <Field.ErrorMessage>{errorMessage}</Field.ErrorMessage>
  ) : (
    <Field.Description>Use a short, specific title.</Field.Description>
  )}
</Field>;
```

### React Hook Form (the way the Forms guide wires it)

`Field invalid={fieldState.invalid}` drives the field-level visual state; render
`Field.ErrorMessage` only when the field is invalid.

```tsx
import { Button, Checkbox, Field, Input, Select } from '@takeoff-ui/react-spar';
import { Controller, useForm } from 'react-hook-form';

function BookingRequestDemo() {
  const form = useForm({
    defaultValues: { title: '', cabin: '', accepted: false },
  });

  return (
    <form onSubmit={form.handleSubmit(() => {})}>
      {/* Text input */}
      <Controller
        name="title"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field invalid={fieldState.invalid} required>
            <Field.Label>Request title</Field.Label>
            <Input>
              <Input.Field
                {...field}
                aria-invalid={fieldState.invalid}
                placeholder="Change return flight"
              />
            </Input>
            {fieldState.invalid ? (
              <Field.ErrorMessage>
                {fieldState.error?.message}
              </Field.ErrorMessage>
            ) : (
              <Field.Description>
                Use a short, specific title.
              </Field.Description>
            )}
          </Field>
        )}
      />

      {/* Select */}
      <Controller
        name="cabin"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field invalid={fieldState.invalid} required>
            <Field.Label>Cabin</Field.Label>
            <Select
              name={field.name}
              value={field.value}
              onChange={field.onChange}
              invalid={fieldState.invalid}
            >
              <Select.Trigger
                placeholder="Select cabin"
                aria-invalid={fieldState.invalid}
              />
              <Select.Content>
                <Select.Item value="economy" label="Economy">
                  Economy
                </Select.Item>
                <Select.Item value="business" label="Business">
                  Business
                </Select.Item>
              </Select.Content>
            </Select>
            {fieldState.invalid ? (
              <Field.ErrorMessage>
                {fieldState.error?.message}
              </Field.ErrorMessage>
            ) : null}
          </Field>
        )}
      />

      {/* Checkbox — label/description sit beside the control */}
      <Controller
        name="accepted"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field invalid={fieldState.invalid} required>
            <div className="flex items-start gap-3">
              <Checkbox
                checked={field.value}
                onChange={field.onChange}
                name={field.name}
                aria-invalid={fieldState.invalid}
              >
                <Checkbox.Indicator />
              </Checkbox>
              <div className="grid gap-1">
                <Field.Label>I accept the booking terms</Field.Label>
                {!fieldState.invalid ? (
                  <Field.Description>
                    Required before submission.
                  </Field.Description>
                ) : null}
              </div>
            </div>
            {fieldState.invalid ? (
              <Field.ErrorMessage>
                {fieldState.error?.message}
              </Field.ErrorMessage>
            ) : null}
          </Field>
        )}
      />

      <Button type="submit">Submit</Button>
    </form>
  );
}
```

### TanStack Form

Map each `form.Field`'s state into a Takeoff `Field`. Compute `invalid` from the
field's meta and pass it to `Field invalid`.

```tsx
import { Field, Input } from '@takeoff-ui/react-spar';

<form.Field name="title">
  {field => {
    const invalid = field.state.meta.errors.length > 0;
    const message = field.state.meta.errors[0]?.message;
    return (
      <Field invalid={invalid} required>
        <Field.Label>Request title</Field.Label>
        <Input>
          <Input.Field
            name={field.name}
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={event => field.handleChange(event.target.value)}
            aria-invalid={invalid}
          />
        </Input>
        {invalid ? (
          <Field.ErrorMessage>{message}</Field.ErrorMessage>
        ) : (
          <Field.Description>Use a short, specific title.</Field.Description>
        )}
      </Field>
    );
  }}
</form.Field>;
```

## Props

### `Field` (root)

Polymorphic: defaults to `div`, accepts `as` / standard `div` attributes plus
the props below.

| Prop         | Type                                | Default | Notes                                                                                                                         |
| ------------ | ----------------------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `invalid`    | `boolean`                           | `false` | Marks the field invalid. Sets `data-invalid` on the root and propagates to nested control + `Field.ErrorMessage` via context. |
| `disabled`   | `boolean`                           | `false` | Disables the field; propagates `data-disabled` to nested control.                                                             |
| `required`   | `boolean`                           | `false` | Marks the field required; `Field.Label` auto-renders the `*` asterisk.                                                        |
| `optional`   | `boolean`                           | `false` | Marks the field optional (mutually conventional with `required`).                                                             |
| `readOnly`   | `boolean`                           | `false` | Marks the field read-only; propagates `data-readonly`.                                                                        |
| `id`         | `string`                            | auto    | Base id used to derive label `htmlFor` / `aria-describedby` associations.                                                     |
| `children`   | `ReactNode \| (state) => ReactNode` | —       | Field parts + the single control. Supports a render-function form (Spar).                                                     |
| `classNames` | `ClassNamesMap<'root'>`             | —       | Per-slot class overrides.                                                                                                     |
| `slotProps`  | `SlotPropsMap<'root'>`              | —       | Per-slot prop overrides.                                                                                                      |

State flows down through Spar's Field context, so `data-invalid` /
`data-disabled` / `data-required` / `data-readonly` are emitted by Spar's root —
you do **not** set them manually.

### `Field.Label`

Polymorphic: defaults to `label`.

| Prop         | Type                                  | Default | Notes                                                  |
| ------------ | ------------------------------------- | ------- | ------------------------------------------------------ |
| `children`   | `ReactNode`                           | —       | Label text.                                            |
| `classNames` | `ClassNamesMap<'root' \| 'asterisk'>` | —       | `asterisk` slot styles the auto-rendered required `*`. |
| `slotProps`  | `SlotPropsMap<'root' \| 'asterisk'>`  | —       | Per-slot prop overrides.                               |

`htmlFor` is wired automatically from Field context. The `*` asterisk
(`.tk-field-asterisk`, `aria-hidden`) renders only when the parent `Field` is
`required`.

### `Field.Description`

Polymorphic: defaults to `div`.

| Prop         | Type                              | Default | Notes                                                                           |
| ------------ | --------------------------------- | ------- | ------------------------------------------------------------------------------- |
| `children`   | `ReactNode`                       | —       | Helper text. A leading decorative info icon auto-renders when there is content. |
| `classNames` | `ClassNamesMap<'root' \| 'icon'>` | —       | `icon` slot styles the leading info icon.                                       |
| `slotProps`  | `SlotPropsMap<'root' \| 'icon'>`  | —       | Per-slot prop overrides.                                                        |

Wired into the control's `aria-describedby` by Spar's Field context.

### `Field.ErrorMessage`

Polymorphic: defaults to `div`.

| Prop         | Type                              | Default | Notes                                                                           |
| ------------ | --------------------------------- | ------- | ------------------------------------------------------------------------------- |
| `children`   | `ReactNode`                       | —       | Error text. A leading decorative error icon auto-renders when there is content. |
| `classNames` | `ClassNamesMap<'root' \| 'icon'>` | —       | `icon` slot styles the leading error icon.                                      |
| `slotProps`  | `SlotPropsMap<'root' \| 'icon'>`  | —       | Per-slot prop overrides.                                                        |

Rendered with `role="alert"` by Spar so screen readers announce it when it
appears. Render it conditionally (only when the field is invalid).

## Slots (for `classNames` / `slotProps`)

| Component            | Slots              |
| -------------------- | ------------------ |
| `Field`              | `root`             |
| `Field.Label`        | `root`, `asterisk` |
| `Field.Description`  | `root`, `icon`     |
| `Field.ErrorMessage` | `root`, `icon`     |

## Exported types

From `@takeoff-ui/react-spar`:

```ts
(FieldProps,
  FieldSlot,
  FieldLabelProps,
  FieldLabelSlot,
  FieldDescriptionProps,
  FieldDescriptionSlot,
  FieldErrorMessageProps,
  FieldErrorMessageSlot);
```

## Accessibility

- `Field` provides shared ARIA context so the label (`htmlFor`), description
  (`aria-describedby`), and error (`role="alert"`) are wired to the nested
  control automatically — you don't manage the ids by hand.
- Set `aria-invalid` on the control (e.g. `Input.Field`, `Select.Trigger`) in
  addition to `Field invalid` so assistive tech and styling both reflect the
  invalid state.
- The required `*` asterisk and the description / error icons are decorative
  (`aria-hidden`); the required state itself is conveyed via Field state, not
  the glyph.
- Render `Field.ErrorMessage` only while invalid so the `role="alert"` is
  announced when the error appears.

## API Reference

`Field` wraps the Spar primitive `Field`. The Takeoff parts (`Field`,
`Field.Label`, `Field.Description`, `Field.ErrorMessage`) map onto Spar's
`Field`, `FieldLabel`, `FieldDescription`, `FieldErrorMessage`
(`@turkish-technology/spar`). State and ARIA associations come from Spar's
`useFieldContext`.

Field is documented within the Takeoff Forms guides:

- React Hook Form:
  https://takeoff-v2.app.turkishtechlab.com/docs/forms/react-hook-form
- TanStack Form:
https://takeoff-v2.app.turkishtechlab.com/docs/forms/tanstack-form
</content>

</invoke>

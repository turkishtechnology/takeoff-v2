---
name: takeoff-field
description:
  'Field form-field wrapper (label + description + error message + shared
  ARIA/invalid/required state) for a nested control, from @takeoff-ui/react-spar
  (Takeoff UI / Spar React). Use WHENEVER building, adding, importing, styling,
  validating, or fixing a Field, Field.Label, Field.Description, or
  Field.ErrorMessage in a React app using @takeoff-ui/react-spar / Takeoff /
  Spar — e.g. form field wrapper, form label, helper/hint text, validation/error
  message, required asterisk, aria-invalid, react-hook-form or tanstack-form
  field anatomy.'
---

# Field — @takeoff-ui/react-spar

`Field` is a form-field wrapper that gives a single nested control (Input,
Switch, Checkbox, Radio, Select) shared ARIA context — label association,
description, error message — plus the field's `invalid` / `required` /
`disabled` / `readOnly` state.

**When to use:** Wrap one form control to attach a visible label, helper text,
and a validation error message that are correctly associated for screen readers.
Drive `invalid` from your form library's field state. Not this — the actual text
box, toggle, etc. are separate components (`takeoff-input`, `takeoff-switch`,
`takeoff-checkbox`, `takeoff-select`); `Field` only wraps them.

## Setup

Requires the Takeoff provider + token CSS mounted once at the app root (see the
`takeoff-ui` skill or the installation docs). Then import:

```tsx
import { Field } from '@takeoff-ui/react-spar';
```

`Field` is compound — the parts are static properties, not separate exports.

## Compound parts

- `Field` — root `div`. Holds form/a11y state, provides Field context to the
  nested control + parts.
- `Field.Label` — `label`. `htmlFor` wired automatically; auto-renders a `*`
  asterisk when the Field is `required`.
- `Field.Description` — helper/hint text, wired into `aria-describedby`;
  auto-renders a leading info icon when it has content.
- `Field.ErrorMessage` — error text rendered with `role="alert"`; auto-renders a
  leading error icon when it has content. Render only while invalid.

## Basic usage

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

## Examples

### React Hook Form

`Field invalid={fieldState.invalid}` drives the visual state; show the error
only when invalid.

```tsx
import { Field, Input } from '@takeoff-ui/react-spar';
import { Controller, useForm } from 'react-hook-form';

const form = useForm({ defaultValues: { title: '' } });

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
        <Field.ErrorMessage>{fieldState.error?.message}</Field.ErrorMessage>
      ) : (
        <Field.Description>Use a short, specific title.</Field.Description>
      )}
    </Field>
  )}
/>;
```

### Select control

```tsx
import { Field, Select } from '@takeoff-ui/react-spar';

<Field invalid={isInvalid} required>
  <Field.Label>Cabin</Field.Label>
  <Select name="cabin" value={value} onChange={onChange} invalid={isInvalid}>
    <Select.Trigger placeholder="Select cabin" aria-invalid={isInvalid} />
    <Select.Content>
      <Select.Item value="economy" label="Economy">
        Economy
      </Select.Item>
      <Select.Item value="business" label="Business">
        Business
      </Select.Item>
    </Select.Content>
  </Select>
  {isInvalid ? <Field.ErrorMessage>{errorMessage}</Field.ErrorMessage> : null}
</Field>;
```

### Checkbox — label/description beside the control

```tsx
import { Field, Checkbox } from '@takeoff-ui/react-spar';

<Field invalid={isInvalid} required>
  <div className="flex items-start gap-3">
    <Checkbox
      checked={checked}
      onChange={onChange}
      name="accepted"
      aria-invalid={isInvalid}
    >
      <Checkbox.Indicator />
    </Checkbox>
    <div className="grid gap-1">
      <Field.Label>I accept the booking terms</Field.Label>
      {!isInvalid ? (
        <Field.Description>Required before submission.</Field.Description>
      ) : null}
    </div>
  </div>
  {isInvalid ? <Field.ErrorMessage>{errorMessage}</Field.ErrorMessage> : null}
</Field>;
```

### TanStack Form

```tsx
import { Field, Input } from '@takeoff-ui/react-spar';

<form.Field name="title">
  {field => {
    const invalid = field.state.meta.errors.length > 0;
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
          <Field.ErrorMessage>
            {field.state.meta.errors[0]?.message}
          </Field.ErrorMessage>
        ) : (
          <Field.Description>Use a short, specific title.</Field.Description>
        )}
      </Field>
    );
  }}
</form.Field>;
```

## Key props

| Prop                       | Type                                | Default | Notes                                                                                                      |
| -------------------------- | ----------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------- |
| `invalid`                  | `boolean`                           | `false` | Marks field invalid; propagates to control + `Field.ErrorMessage`. Also set `aria-invalid` on the control. |
| `required`                 | `boolean`                           | `false` | Marks required; `Field.Label` auto-renders the `*` asterisk.                                               |
| `disabled`                 | `boolean`                           | `false` | Disables the field; propagates `data-disabled`.                                                            |
| `readOnly`                 | `boolean`                           | `false` | Read-only state; propagates `data-readonly`.                                                               |
| `optional`                 | `boolean`                           | `false` | Marks the field optional.                                                                                  |
| `id`                       | `string`                            | auto    | Base id for label/`aria-describedby` associations.                                                         |
| `children`                 | `ReactNode \| (state) => ReactNode` | —       | Field parts + the single control.                                                                          |
| `classNames` / `slotProps` | per-slot maps                       | —       | Slot overrides (`root`; plus `asterisk` on Label, `icon` on Description/ErrorMessage).                     |

Full props, events, data attributes & type definitions: see
`references/full-docs.md`.

## Accessibility

- `Field` auto-wires label `htmlFor`, description `aria-describedby`, and error
  `role="alert"` to the nested control — don't manage the ids manually.
- Also set `aria-invalid` on the control (`Input.Field`, `Select.Trigger`, etc.)
  so styling and assistive tech both reflect the invalid state.
- The required `*` and the description/error icons are decorative
  (`aria-hidden`); required state is conveyed via Field state, not the glyph.
- Render `Field.ErrorMessage` only while invalid so its `role="alert"` is
  announced when it appears.

## Reference

- Full component docs: `references/full-docs.md`
- Forms guides (where Field is documented):
  https://takeoff-v2.app.turkishtechlab.com/docs/forms/react-hook-form and
  https://takeoff-v2.app.turkishtechlab.com/docs/forms/tanstack-form
- Source: `packages/react-spar/src/components/field/`
- Spar primitive: `Field` (`@turkish-technology/spar`)
</content>

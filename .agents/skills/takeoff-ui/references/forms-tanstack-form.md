# TanStack Form

Build forms by letting TanStack Form manage values, validation, submission, and
field state. Use Takeoff `Field` components for the visible field anatomy:
label, description, invalid state, and error message.

## Demo

The form below shows the field structure and error display behavior.

```tsx
function BookingRequestDemo() {
  const formSchema = z.object({
    title: z
      .string()
      .min(5, 'Title must be at least 5 characters.')
      .max(48, 'Title must be at most 48 characters.'),
    cabin: z.string().min(1, 'Select a cabin.'),
    accepted: z.boolean().refine(Boolean, 'You must accept the terms.'),
  });

  const form = useForm({
    defaultValues: {
      title: '',
      cabin: '',
      accepted: false,
    },
    validators: {
      onChange: formSchema,
    },
    onSubmit: async () => {},
  });

  return (
    <form
      id="form-tan-demo"
      onSubmit={event => {
        event.preventDefault();
        event.stopPropagation();
        form.handleSubmit();
      }}
      className="grid w-full max-w-90 gap-3"
    >
      <form.Field name="title">
        {field => {
          const invalid =
            field.state.meta.isTouched && !!field.state.meta.errors.length;
          const error = field.state.meta.errors[0];
          const message = typeof error === 'string' ? error : error?.message;

          return (
            <Field invalid={invalid} required>
              <Field.Label>Request title</Field.Label>
              <Input>
                <Input.Field
                  name={field.name}
                  value={field.state.value}
                  onChange={event => field.handleChange(event.target.value)}
                  onBlur={field.handleBlur}
                  aria-invalid={invalid}
                  placeholder="Change return flight"
                  autoComplete="off"
                />
              </Input>
              {invalid ? (
                <Field.ErrorMessage>{message}</Field.ErrorMessage>
              ) : (
                <Field.Description>
                  Use a short, specific title.
                </Field.Description>
              )}
            </Field>
          );
        }}
      </form.Field>

      <form.Field name="cabin">
        {field => {
          const invalid =
            field.state.meta.isTouched && !!field.state.meta.errors.length;
          const error = field.state.meta.errors[0];
          const message = typeof error === 'string' ? error : error?.message;

          return (
            <Field invalid={invalid} required>
              <Field.Label>Cabin</Field.Label>
              <Select
                name={field.name}
                value={field.state.value}
                onChange={field.handleChange}
                invalid={invalid}
              >
                <Select.Trigger
                  placeholder="Select cabin"
                  aria-invalid={invalid}
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
              {invalid ? (
                <Field.ErrorMessage>{message}</Field.ErrorMessage>
              ) : null}
            </Field>
          );
        }}
      </form.Field>

      <form.Field name="accepted">
        {field => {
          const invalid =
            field.state.meta.isTouched && !!field.state.meta.errors.length;
          const error = field.state.meta.errors[0];
          const message = typeof error === 'string' ? error : error?.message;

          return (
            <Field invalid={invalid} required>
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={field.state.value}
                  onChange={field.handleChange}
                  aria-invalid={invalid}
                >
                  <Checkbox.Indicator />
                </Checkbox>
                <div className="grid gap-1">
                  <Field.Label>I accept the booking terms</Field.Label>
                  {!invalid ? (
                    <Field.Description>
                      Required before submission.
                    </Field.Description>
                  ) : null}
                </div>
              </div>
              {invalid ? (
                <Field.ErrorMessage>{message}</Field.ErrorMessage>
              ) : null}
            </Field>
          );
        }}
      </form.Field>

      <div className="flex items-center justify-end gap-3">
        <Button
          type="button"
          variant="neutral"
          appearance="outlined"
          onClick={() => form.reset()}
        >
          Reset
        </Button>
        <Button type="submit" form="form-tan-demo">
          Continue
        </Button>
      </div>
    </form>
  );
}

render(<BookingRequestDemo />);
```

## Approach

Use TanStack Form's `useForm` hook to create the form instance. Use `form.Field`
when a component is composed or controlled, because the render function gives
you a clear place to map form state into Takeoff props.

- `field.state.value` contains the current field value.
- `field.handleChange` and `field.handleBlur` connect the component to the form.
- `field.state.meta.errors` contains validation messages.
- `Field invalid={...}` drives the field-level visual state.
- `aria-invalid={...}` belongs on the interactive control.

## Anatomy

```tsx
<form.Field name="title">
  {field => {
    const invalid =
      field.state.meta.isTouched && !!field.state.meta.errors.length;

    return (
      <Field invalid={invalid} required>
        <Field.Label>Request title</Field.Label>
        <Input>
          <Input.Field
            name={field.name}
            value={field.state.value}
            onChange={event => field.handleChange(event.target.value)}
            onBlur={field.handleBlur}
            aria-invalid={invalid}
            autoComplete="off"
          />
        </Input>
        <Field.Description>Use a short, specific title.</Field.Description>
        {invalid ? (
          <Field.ErrorMessage>
            {String(field.state.meta.errors[0])}
          </Field.ErrorMessage>
        ) : null}
      </Field>
    );
  }}
</form.Field>
```

## Form

### Create a Form Schema

Define the shape and validation messages in your validators. TanStack Form lets
you attach validation where the field lives, or provide a form-level schema with
a Standard Schema library such as Zod.

```tsx
import * as z from 'zod';

const formSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters.')
    .max(48, 'Title must be at most 48 characters.'),
  cabin: z.string().min(1, 'Select a cabin.'),
  accepted: z.boolean().refine(Boolean, 'You must accept the terms.'),
});

type FormValues = z.infer<typeof formSchema>;
```

### Set Up the Form

Create the form instance with `useForm`, pass the schema to `validators`, and
handle submit at the form level.

```tsx
import { useForm } from '@tanstack/react-form';
import * as z from 'zod';

export function BookingRequestForm() {
  const form = useForm({
    defaultValues: {
      title: '',
      cabin: '',
      accepted: false,
    },
    validators: {
      onChange: formSchema,
    },
    onSubmit: async ({ value }) => {
      console.log(value);
    },
  });

  return (
    <form
      onSubmit={event => {
        event.preventDefault();
        event.stopPropagation();
        form.handleSubmit();
      }}
    >
      {/* Build the form here */}
    </form>
  );
}
```

### Build the Form

Use `form.Field` for each field and map its state into `Field`.

```tsx
import { useForm } from '@tanstack/react-form';
import { Button, Checkbox, Field, Input, Select } from '@takeoff-ui/react-spar';

export function BookingRequestForm() {
  const form = useForm({
    defaultValues: {
      title: '',
      cabin: '',
      accepted: false,
    },
    validators: {
      onChange: formSchema,
    },
    onSubmit: async ({ value }) => {
      console.log(value);
    },
  });

  return (
    <form
      onSubmit={event => {
        event.preventDefault();
        event.stopPropagation();
        form.handleSubmit();
      }}
      className="grid gap-4"
    >
      <form.Field
        name="title"
        validators={{
          onBlur: ({ value }) =>
            !value ? 'Request title is required' : undefined,
        }}
      >
        {field => {
          const invalid =
            field.state.meta.isTouched && !!field.state.meta.errors.length;

          return (
            <Field invalid={invalid} required>
              <Field.Label>Request title</Field.Label>
              <Input>
                <Input.Field
                  name={field.name}
                  value={field.state.value}
                  onChange={event => field.handleChange(event.target.value)}
                  onBlur={field.handleBlur}
                  aria-invalid={invalid}
                  autoComplete="off"
                />
              </Input>
              {invalid ? (
                <Field.ErrorMessage>
                  {String(field.state.meta.errors[0])}
                </Field.ErrorMessage>
              ) : null}
            </Field>
          );
        }}
      </form.Field>

      <form.Field
        name="cabin"
        validators={{
          onSubmit: ({ value }) => (!value ? 'Select a cabin' : undefined),
        }}
      >
        {field => {
          const invalid = !!field.state.meta.errors.length;

          return (
            <Field invalid={invalid} required>
              <Field.Label>Cabin</Field.Label>
              <Select
                name={field.name}
                value={field.state.value}
                onChange={field.handleChange}
                invalid={invalid}
              >
                <Select.Trigger
                  placeholder="Select cabin"
                  aria-invalid={invalid}
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
              {invalid ? (
                <Field.ErrorMessage>
                  {String(field.state.meta.errors[0])}
                </Field.ErrorMessage>
              ) : null}
            </Field>
          );
        }}
      </form.Field>

      <form.Field
        name="accepted"
        validators={{
          onSubmit: ({ value }) =>
            value ? undefined : 'You must accept the terms',
        }}
      >
        {field => {
          const invalid = !!field.state.meta.errors.length;

          return (
            <Field invalid={invalid} required>
              <Checkbox
                checked={field.state.value}
                onChange={field.handleChange}
                aria-invalid={invalid}
              >
                <Checkbox.Indicator />
              </Checkbox>
              <Field.Label>I accept the booking terms</Field.Label>
              {invalid ? (
                <Field.ErrorMessage>
                  {String(field.state.meta.errors[0])}
                </Field.ErrorMessage>
              ) : null}
            </Field>
          );
        }}
      </form.Field>

      <Button type="submit">Continue</Button>
    </form>
  );
}
```

### Done

When the user submits, TanStack Form validates the data and calls your submit
handler with the final values. Invalid fields receive errors through
`field.state.meta.errors`, and each field can render its own
`Field.ErrorMessage`.

## Validation

### Client-Side Validation

Validation lives in the field validators. Field rendering does not need to know
where the error came from; it only reads `field.state.meta.errors`.

```tsx
<form.Field
  name="title"
  validators={{
    onBlur: ({ value }) => (!value ? 'Request title is required' : undefined),
  }}
>
  {/* field render */}
</form.Field>
```

### Schema Validation with Zod

TanStack Form supports Standard Schema validators, so you can pass a Zod schema
directly to the form or to an individual field validator. This keeps the data
shape and validation rules in one place.

```tsx
import * as z from 'zod';

const formSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters.'),
  cabin: z.string().min(1, 'Select a cabin.'),
  accepted: z.boolean().refine(Boolean, 'You must accept the terms.'),
});

const form = useForm({
  defaultValues: {
    title: '',
    cabin: '',
    accepted: false,
  },
  validators: {
    onChange: formSchema,
  },
  onSubmit: async ({ value }) => {
    console.log(value);
  },
});
```

### Validation Modes

TanStack Form lets you choose when each validator runs:

| Mode       | Description                             |
| ---------- | --------------------------------------- |
| `onChange` | Validate on every change.               |
| `onBlur`   | Validate when a field loses focus.      |
| `onSubmit` | Validate when the form is submitted.    |
| `onMount`  | Validate when the form or field mounts. |

```tsx
<form.Field
  name="email"
  validators={{
    onBlur: ({ value }) => (!value ? 'Email is required' : undefined),
    onSubmit: ({ value }) =>
      !value.includes('@') ? 'Enter a valid email' : undefined,
  }}
>
  {/* field render */}
</form.Field>
```

## Displaying Errors

Display errors next to the field they belong to. For styling and accessibility:

- Compute `invalid` from the field meta.
- Pass that value to `Field invalid`.
- Pass the same value to the interactive control with `aria-invalid`.
- Render `Field.ErrorMessage` only when the field is invalid.

```tsx
const invalid = field.state.meta.isTouched && !!field.state.meta.errors.length;
const error = field.state.meta.errors[0];

return (
  <Field invalid={invalid}>
    <Field.Label>Request title</Field.Label>
    <Input>
      <Input.Field
        name={field.name}
        value={field.state.value}
        onChange={event => field.handleChange(event.target.value)}
        onBlur={field.handleBlur}
        aria-invalid={invalid}
      />
    </Input>
    {invalid ? <Field.ErrorMessage>{error.message}</Field.ErrorMessage> : null}
  </Field>
);
```

If you use field-level string validators, render
`String(field.state.meta.errors[0])`. If you use a schema validator such as Zod,
render the structured error message.

## Working with Different Field Types

The field anatomy stays the same. Only the value mapping changes:

| Component     | Mapping                                                                                                                  |
| ------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `Input.Field` | Use `value={field.state.value}` and pass `event.target.value` to `field.handleChange`.                                   |
| `Select`      | Use `value={field.state.value}` and `onChange={field.handleChange}` on `Select`; put `aria-invalid` on `Select.Trigger`. |
| `Checkbox`    | Use `checked={field.state.value}` and `onChange={field.handleChange}`.                                                   |
| `Switch`      | Use `checked={field.state.value}` and `onChange={field.handleChange}`.                                                   |
| `Radio`       | Use `value={field.state.value}` and `onChange={field.handleChange}` on the `Radio` root.                                 |

## Array Fields

Use `mode="array"` when the form needs a repeatable set of fields such as
passengers, baggage items, or contact methods. Keep the array state in TanStack
Form, then render one `Field` per item.

The live demo below mirrors the same add, remove, reset, and submit flow as the
code sample.

```tsx
function PassengerArrayDemo() {
  const form = useForm({
    defaultValues: {
      passengers: [{ fullName: '' }],
    },
    onSubmit: async () => {},
  });

  return (
    <form
      onSubmit={event => {
        event.preventDefault();
        event.stopPropagation();
        form.handleSubmit();
      }}
      className="grid w-full max-w-90 gap-3"
    >
      <form.Field name="passengers" mode="array">
        {passengersField => (
          <>
            {passengersField.state.value.map((_, index) => {
              const canRemove = passengersField.state.value.length > 1;

              return (
                <form.Field
                  key={index}
                  name={'passengers[' + index + '].fullName'}
                  validators={{
                    onChange: ({ value }) =>
                      !value.trim() ? 'Passenger name is required.' : undefined,
                  }}
                >
                  {field => {
                    const invalid =
                      field.state.meta.isTouched &&
                      !!field.state.meta.errors.length;
                    const error = field.state.meta.errors[0];
                    const message =
                      typeof error === 'string' ? error : error?.message;

                    return (
                      <Field invalid={invalid} required>
                        <Field.Label>Passenger {index + 1}</Field.Label>
                        <Input>
                          <Input.Field
                            name={field.name}
                            value={field.state.value}
                            onChange={event =>
                              field.handleChange(event.target.value)
                            }
                            onBlur={field.handleBlur}
                            aria-invalid={invalid}
                            autoComplete="name"
                            placeholder="Ada Lovelace"
                          />
                          <Input.Suffix>
                            <button
                              type="button"
                              aria-label={
                                canRemove
                                  ? 'Remove passenger ' + (index + 1)
                                  : 'At least one passenger is required'
                              }
                              disabled={!canRemove}
                              onClick={() => passengersField.removeValue(index)}
                              className="inline-flex h-5 w-5 justify-center"
                            >
                              <CloseIconOutlinedRounded />
                            </button>
                          </Input.Suffix>
                        </Input>
                        {invalid ? (
                          <Field.ErrorMessage>{message}</Field.ErrorMessage>
                        ) : null}
                      </Field>
                    );
                  }}
                </form.Field>
              );
            })}
            <Button
              type="button"
              variant="neutral"
              appearance="outlined"
              onClick={() => passengersField.pushValue({ fullName: '' })}
              className="w-full"
            >
              Add passenger
            </Button>

            <div className="flex w-full justify-end border-t border-gray-300 pt-3">
              <Button type="submit">Save passengers</Button>
              <Button
                type="button"
                variant="neutral"
                appearance="text"
                onClick={() => form.reset({ passengers: [{ fullName: '' }] })}
              >
                Reset
              </Button>
            </div>
          </>
        )}
      </form.Field>
    </form>
  );
}

render(<PassengerArrayDemo />);
```

## Notes

- Keep validation and value transformation in TanStack Form.
- Pass visual validation state to `Field invalid`.
- Put `aria-invalid` on the interactive control.
- Prefer `Field.ErrorMessage` for new examples. `Field.ErrorMessage` remains
  supported.

# React Hook Form

Build forms by letting React Hook Form manage values, validation, submission,
and field state. Use Takeoff `Field` components for the visible field anatomy:
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
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      cabin: '',
      accepted: false,
    },
  });

  return (
    <form
      id="form-rhf-demo"
      onSubmit={form.handleSubmit(() => {})}
      className="grid w-full max-w-90 gap-3"
    >
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
                autoComplete="off"
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

      <div className="flex items-center justify-end gap-3">
        <Button
          type="button"
          variant="neutral"
          appearance="outlined"
          onClick={() => form.reset()}
        >
          Reset
        </Button>
        <Button type="submit" form="form-rhf-demo">
          Submit
        </Button>
      </div>
    </form>
  );
}

render(<BookingRequestDemo />);
```

## Approach

Use React Hook Form's `useForm` hook to create the form instance. Use
`Controller` when a component is composed or controlled, because the render
function gives you a clear place to map form state into Takeoff props.

- `field` contains bindings such as `name`, `value`, `onChange`, `onBlur`, and
  `ref`.
- `fieldState` contains the field's validation state, including `invalid` and
  `error`.
- `Field invalid={fieldState.invalid}` drives the field-level visual state.
- `aria-invalid={fieldState.invalid}` belongs on the interactive control.

## Anatomy

```tsx
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
          autoComplete="off"
        />
      </Input>
      <Field.Description>Use a short, specific title.</Field.Description>
      {fieldState.invalid ? (
        <Field.ErrorMessage>{fieldState.error?.message}</Field.ErrorMessage>
      ) : null}
    </Field>
  )}
/>
```

## Form

### Create a Form Schema

Define the shape and validation messages for the form. The example below uses
Zod, but the field anatomy stays the same with any resolver supported by React
Hook Form.

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
```

### Set Up the Form

Create the form instance with `useForm`, pass the schema resolver, and define
default values for every field.

```tsx
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

type FormValues = z.infer<typeof formSchema>;

export function BookingRequestForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      cabin: '',
      accepted: false,
    },
  });

  function onSubmit(values: FormValues) {
    console.log(values);
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Build the form here */}
    </form>
  );
}
```

### Build the Form

Use `Controller` for each field and map `fieldState` into `Field`.

```tsx
import { Controller } from 'react-hook-form';
import { Button, Checkbox, Field, Input, Select } from '@takeoff-ui/react-spar';

export function BookingRequestForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      cabin: '',
      accepted: false,
    },
  });

  return (
    <form
      onSubmit={form.handleSubmit(values => console.log(values))}
      className="grid gap-4"
    >
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
                autoComplete="off"
              />
            </Input>
            {fieldState.invalid ? (
              <Field.ErrorMessage>
                {fieldState.error?.message}
              </Field.ErrorMessage>
            ) : null}
          </Field>
        )}
      />

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

      <Controller
        name="accepted"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field invalid={fieldState.invalid} required>
            <Checkbox
              checked={field.value}
              onChange={field.onChange}
              name={field.name}
              aria-invalid={fieldState.invalid}
            >
              <Checkbox.Indicator />
            </Checkbox>
            <Field.Label>I accept the booking terms</Field.Label>
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

### Done

When the user submits, React Hook Form validates the data and calls your submit
handler with the validated values. Invalid fields receive `fieldState.invalid`,
and each field can render its own `Field.ErrorMessage`.

## Validation

### Client-Side Validation

Schema validation lives in the `resolver` option. Field rendering does not need
to know where the error came from; it only reads `fieldState`.

```tsx
const form = useForm<FormValues>({
  resolver: zodResolver(formSchema),
  defaultValues: {
    title: '',
    cabin: '',
    accepted: false,
  },
});
```

### Validation Modes

React Hook Form supports different validation modes:

| Mode        | Description                                          |
| ----------- | ---------------------------------------------------- |
| `onSubmit`  | Validate on submit. This is the default.             |
| `onBlur`    | Validate when a field loses focus.                   |
| `onChange`  | Validate on every change.                            |
| `onTouched` | Validate after the first blur, then on every change. |
| `all`       | Validate on both blur and change.                    |

```tsx
const form = useForm<FormValues>({
  resolver: zodResolver(formSchema),
  mode: 'onBlur',
});
```

## Displaying Errors

Display errors next to the field they belong to. For styling and accessibility:

- Pass `fieldState.invalid` to `Field invalid`.
- Pass `fieldState.invalid` to the interactive control with `aria-invalid`.
- Render `Field.ErrorMessage` only when the field is invalid.

```tsx
<Controller
  name="title"
  control={form.control}
  render={({ field, fieldState }) => (
    <Field invalid={fieldState.invalid}>
      <Field.Label>Request title</Field.Label>
      <Input>
        <Input.Field {...field} aria-invalid={fieldState.invalid} />
      </Input>
      {fieldState.invalid ? (
        <Field.ErrorMessage>{fieldState.error?.message}</Field.ErrorMessage>
      ) : null}
    </Field>
  )}
/>
```

## Working with Different Field Types

The field anatomy stays the same. Only the value mapping changes:

| Component     | Mapping                                                                                                        |
| ------------- | -------------------------------------------------------------------------------------------------------------- |
| `Input.Field` | Spread `field`, then add `aria-invalid={fieldState.invalid}`.                                                  |
| `Select`      | Use `value={field.value}` and `onChange={field.onChange}` on `Select`; put `aria-invalid` on `Select.Trigger`. |
| `Checkbox`    | Use `checked={field.value}` and `onChange={field.onChange}`.                                                   |
| `Switch`      | Use `checked={field.value}` and `onChange={field.onChange}`.                                                   |
| `Radio`       | Use `value={field.value}` and `onChange={field.onChange}` on the `Radio` root.                                 |

```tsx
<Controller
  name="cabin"
  control={form.control}
  render={({ field, fieldState }) => (
    <Field invalid={fieldState.invalid}>
      <Field.Label>Cabin</Field.Label>
      <Select
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
        <Field.ErrorMessage>{fieldState.error?.message}</Field.ErrorMessage>
      ) : null}
    </Field>
  )}
/>
```

## Array Fields

Use `useFieldArray` when the form needs a repeatable set of fields such as
passengers, baggage items, or contact methods. Keep the array state in React
Hook Form, then render one `Field` per item.

The live demo below mirrors the same add, remove, reset, and submit flow as the
code sample.

```tsx
function PassengerArrayDemo() {
  const formSchema = z.object({
    passengers: z
      .array(
        z.object({
          fullName: z.string().min(1, 'Passenger name is required.'),
        }),
      )
      .min(1, 'Add at least one passenger.'),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      passengers: [{ fullName: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'passengers',
  });

  return (
    <form
      onSubmit={form.handleSubmit(() => {})}
      className="grid w-full max-w-90 gap-3"
    >
      {fields.map((item, index) => {
        const canRemove = fields.length > 1;

        return (
          <Controller
            key={item.id}
            name={'passengers.' + index + '.fullName'}
            control={form.control}
            render={({ field, fieldState }) => (
              <Field invalid={fieldState.invalid} required>
                <Field.Label>Passenger {index + 1}</Field.Label>
                <Input>
                  <Input.Field
                    {...field}
                    aria-invalid={fieldState.invalid}
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
                      onClick={() => remove(index)}
                      className="inline-flex h-5 w-5 justify-center"
                    >
                      x
                    </button>
                  </Input.Suffix>
                </Input>
                {fieldState.invalid ? (
                  <Field.ErrorMessage>
                    {fieldState.error?.message}
                  </Field.ErrorMessage>
                ) : null}
              </Field>
            )}
          />
        );
      })}
      <Button
        type="button"
        variant="neutral"
        appearance="outlined"
        onClick={() => append({ fullName: '' })}
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
    </form>
  );
}

render(<PassengerArrayDemo />);
```

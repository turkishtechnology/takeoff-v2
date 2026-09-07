# Recurring rewrites

## Data props to compound children

V1 often accepts serialized data and presentation props. V2 owns behavior in a
parent and exposes semantic child parts. Preserve keys, labels, values, and
loading states while moving markup into the target component's documented
children.

```tsx
// v1
<TkTable columns={columns} data={rows} />
<TkSelect options={options} value={value} onTkChange={handleChange} />
<TkAccordion items={items} />
<TkDialog header="Delete" footer={<Actions />}>
  <ConfirmBody />
</TkDialog>
```

```tsx
// v2 shape: consult the target skill for exact part names and props
<Table>{/* table header, rows, and cells */}</Table>
<Select value={value} onValueChange={handleChange}>{/* option children */}</Select>
<Accordion>{/* trigger and content children */}</Accordion>
<Dialog>{/* trigger, header, content, and footer children */}</Dialog>
```

Do not mechanically copy v1 `columns`, `data`, `items`, `header`, or `footer`
props onto v2 components.

## CustomEvent to callback

Stencil bindings deliver a `CustomEvent`; v1 handlers usually read
`event.detail`. V2 React callbacks receive the value directly:

```tsx
// v1
<TkInput value={value} onTkChange={(event) => setValue(event.detail.value)} />

// v2 shape
<Input value={value} onValueChange={setValue} />
```

Use the v2 component skill for the exact callback name and value type. Do not
forward `event.detail`, and do not retain a `CustomEvent` annotation.

## Styling

Replace shadow-DOM assumptions, `containerStyle`, and internal selectors with
the v2 recipe class, `className`, `classNames`, `slotProps`, and documented
`data-*` attributes. Only attributes listed in a component's Data attributes
table are a styling contract; internal DOM is not. See
`.agents/skills/takeoff-ui/references/composition-styling.md`.

## Forms

Replace hand-rolled label, hint, and validation markup with `Field` + `Label`
when the v2 form pattern fits. Use the v2 references for React Hook Form or
TanStack Form rather than reproducing v1 shadow-DOM structure.

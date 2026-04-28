# API Decision Framework

The per-component decision template applied during port. Use this whenever you
add or refresh a component contract. The output is a single decision sheet
(stored either in `tools/<component>-api-alignment.html` or in the component's
port note) that pins **every** Core / Spar / wrapper surface to one of the six
dispositions defined in
[`contract-model.md`](./contract-model.md#divergence-taxonomy).

> If you skip this step, the component will not pass
> [`component-port-readiness.md`](./component-port-readiness.md). The readiness
> gate enforces the existence of a completed decision sheet.

## When to apply this framework

| Trigger                                                                     | Required artifact                                         |
| --------------------------------------------------------------------------- | --------------------------------------------------------- |
| New component port                                                          | Decision sheet, then implementation, then docs.           |
| Adding a new prop to a shipped component                                    | Append a row to the decision sheet, then implement.       |
| Renaming or removing any public surface                                     | Decision sheet update, ADR, deprecation cycle.            |
| Upstream Core ships a new prop or value enum                                | Decision sheet update; default disposition is `preserve`. |
| Upstream Spar gains a part that overlaps an existing react-enhancement part | Re-classify the wrapper part (see ADR-0003).              |

## The six dispositions (recap)

| Disposition  | Public surface keeps the Core name? | Public surface is a prop or compound? |
| ------------ | :---------------------------------: | :-----------------------------------: |
| `preserve`   |                 Yes                 |                 Prop                  |
| `adapt`      |                 Yes                 |   Prop with reshaped type / payload   |
| `rename`     |      No (React-idiomatic name)      |           Prop or callback            |
| `compound`   |   Yes (slot name → subcomponent)    |         Compound subcomponent         |
| `deprecated` |      Yes (with `@deprecated`)       |     Prop, replaced by a compound      |
| `omitted`    |                 No                  |              Not exposed              |

See [`contract-model.md`](./contract-model.md#divergence-taxonomy) for the
strict definition and obligations of each.

## Decision table

Every decision sheet uses this exact column shape:

| #   | Layer | Source name | Source type | Wrapper name | Wrapper kind | Disposition | Rationale |
| --- | ----- | ----------- | ----------- | ------------ | ------------ | ----------- | --------- |

- **Layer** — `core` (Stencil prop / event / slot), `spar` (Spar prop / callback
  / part), or `react-spar-only` for surfaces invented by the wrapper (rare,
  requires ADR).
- **Source name** — the verbatim name from the source.
- **Source type** — type or signature, copy-paste exact.
- **Wrapper name** — the public name in `@takeoff-ui/react-spar`. Empty if
  `omitted`.
- **Wrapper kind** — `prop`, `callback`, `subcomponent`, `data-attr`,
  `tk-class`. Empty if `omitted`.
- **Disposition** — one of the six.
- **Rationale** — one terse sentence. Required for `adapt`, `rename`,
  `deprecated`, `omitted`. Optional but encouraged for the others.

The decision sheet must have one row per Core surface, one row per Spar surface,
and one row per wrapper-only surface. Rows are not deduplicated; if a Core prop
and a Spar callback both feed the same wrapper prop, both get a row.

## Heuristics by surface type

### Stencil props

Default disposition: `preserve`.

| Symptom                                                        | Disposition                                                                                   |
| -------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Prop is a content placeholder (`label`, `header`, `error`)     | `compound`, with a `deprecated` shim only if a shipped wrapper already exposes it.            |
| Prop is a render override (`renderIcon`)                       | `omitted` on new ports. `deprecated` on shipped surfaces, removed next major. (See ADR-0004.) |
| Prop is a Stencil-only mode (`mode='counter'`, `mode='chips'`) | `omitted` and split into a sibling component (`NumberInput`, `ChipsInput`).                   |
| Prop name conflicts with a React reserved word (`key`, `ref`)  | `rename`. Document the new name and add an alias if migration risk is high.                   |
| Prop value enum changes between major Core releases            | `adapt` (narrow our enum), record an ADR if values are added back later.                      |
| Prop is a behavior toggle Spar already owns                    | `omitted` if Spar's behavior matches; otherwise `adapt`.                                      |
| Prop is a Stencil-internal hook (`reflect`, `mutable`)         | `omitted`. Not part of the public contract.                                                   |

### Stencil events

Default disposition: `rename` to React `onX` form.

| Stencil event            | React name            |
| ------------------------ | --------------------- |
| `tk-change`              | `onChange`            |
| `tk-input`               | `onInput`             |
| `tk-blur`                | `onBlur`              |
| `tk-focus`               | `onFocus`             |
| `tk-clear-click`         | `onClearClick`        |
| `tk-visible-change`      | `onVisibleChange`     |
| `tk-active-index-change` | `onActiveIndexChange` |
| `tk-open` (lifecycle)    | `onOpen`              |
| `tk-close` (lifecycle)   | `onClose`             |

If a Stencil event has no clean React mapping (e.g. it duplicates `onChange`
under a different name), `omitted` is the right call. Record it in the sheet.

### Stencil slots

Default disposition: `compound`.

A Stencil `<slot name="header">` always becomes a `Component.Header`
subcomponent in the wrapper. Never a `header` prop, `headerSlot` prop, or
`renderHeader` prop on new ports.

If the shipped wrapper already exposes a flat content prop for a slot (e.g.
shipped Checkbox `label`), the disposition is `deprecated` until the next major
release. The compound `Component.Header` lands in the same release that
introduces the deprecation.

### Stencil methods

Default disposition: `omitted` for the imperative API; `adapt` for the behavior
into a callback or controlled state.

| Stencil method | Wrapper                                           |
| -------------- | ------------------------------------------------- |
| `open()`       | `defaultVisible` / `visible` controlled state.    |
| `close()`      | Same.                                             |
| `focus()`      | Forwarded `ref` to the focusable owner node.      |
| `clear()`      | `onClearClick` callback or controlled `value=''`. |
| `submit()`     | `onSubmit` callback on a parent form.             |

### Spar props

Default disposition: `omitted` from public surface; the wrapper does not
re-export Spar prop names. The adapter hook maps Takeoff-named props onto Spar's
internal names.

Exceptions where a Spar prop becomes public:

- A Spar prop has the same name and meaning as a Core prop, in which case the
  Core row covers it.
- A Spar prop opens a behavior the wrapper actively wants and Core does not
  expose (rare). Document with an ADR.

### Spar callbacks

Default disposition: `omitted` from public surface (mapped through the adapter).

| Spar callback     | Wrapper public                          |
| ----------------- | --------------------------------------- |
| `onValueChange`   | `onChange`, `onActiveIndexChange`, etc. |
| `onOpenChange`    | `onVisibleChange`                       |
| `onPressedChange` | `onChange` for toggle controls          |

### Spar parts

Default disposition: `compound` (inherited archetype; see CODING_STANDARDS
"Composition Archetypes").

When the wrapper exposes a compound subcomponent, it must:

- Render the upstream Spar part if one exists (inherited archetype).
- Use `react-enhancement` only when no upstream part exists.
- Use `bypass` only with an explicit `@bypass` rationale in `*Base.ts`.

## Controlled / uncontrolled policy

For every stateful prop in the wrapper:

1. The controlled prop uses the Takeoff name (`activeIndex`, `visible`,
   `value`).
2. The uncontrolled prop is `default` + same name (`defaultActiveIndex`,
   `defaultVisible`, `defaultValue`).
3. The callback uses the Takeoff event name in React form
   (`onActiveIndexChange`, `onVisibleChange`, `onChange`).
4. The callback receives the **Takeoff-shaped** value, even when Spar emits a
   different shape internally.

The adapter hook (`useComponentNameAdapter`) is responsible for shape
conversion. The component never inlines the conversion in JSX.

If a Core prop has both a controlled and uncontrolled flavor under different
names (e.g. Core's `activeIndex` defaulting from initial children), the wrapper
still uses the `default*` convention.

## Compatibility (`deprecated`) policy

The `deprecated` disposition is the only path that lets a flat content prop
survive on a public root surface. It exists to retire shipped surfaces without
breaking consumers in a single release.

A `deprecated` prop must:

- Be marked `@deprecated` in JSDoc, with a one-line replacement pointer
  (`@deprecated Use <Checkbox.Label> instead.`).
- Log a single warning in `process.env.NODE_ENV !== 'production'` builds when
  used. Once per component instance, not on every render.
- Be removed in the next major release of the package.
- Be tested in the deprecation state (assert the warning fires).
- Appear in the component's docs page under a "Deprecated" header, with the
  compound replacement next to it.

A `deprecated` prop must **not**:

- Be added to a new component port. It only exists for shipped surfaces being
  retired.
- Be the only way to do something. The compound replacement always lands in the
  same release that introduces the deprecation.

## Worked example

Below is a five-row excerpt from a hypothetical Button decision sheet. The real,
complete sheet lives in `tools/button-api-alignment.html`.

| #   | Layer | Source name    | Source type                                                                                                   | Wrapper name | Wrapper kind | Disposition | Rationale                                                 |
| --- | ----- | -------------- | ------------------------------------------------------------------------------------------------------------- | ------------ | ------------ | ----------- | --------------------------------------------------------- |
| 1   | core  | `variant`      | `'primary' \| 'secondary' \| 'neutral' \| 'info' \| 'success' \| 'danger' \| 'warning' \| 'white' \| 'black'` | `variant`    | prop         | preserve    | Same name, same union, same default `'primary'`.          |
| 2   | core  | `loading`      | `boolean`                                                                                                     | `loading`    | prop         | preserve    | Mapped to Spar `isLoading` inside adapter.                |
| 3   | core  | `label`        | `string`                                                                                                      | (children)   | compound     | compound    | Becomes `Button.Label`. No flat prop on new wrapper.      |
| 4   | core  | `iconPosition` | `'left' \| 'right'`                                                                                           | —            | —            | omitted     | Replaced by `Button.LeadingIcon` / `Button.TrailingIcon`. |
| 5   | core  | `tk-click`     | `MouseEvent`                                                                                                  | `onClick`    | callback     | rename      | React name. Native `MouseEvent` payload preserved.        |

## Decision sheet authoring workflow

1. Run `$generate-api-alignment` to scaffold or refresh the
   `tools/<component>-api-alignment.html` worksheet from current Core, Spar, and
   (if shipped) react-spar sources.
2. Fill in dispositions row by row. The worksheet exports markdown for the PR.
3. If any disposition is `adapt`, `rename`, `deprecated`, or `omitted`, write
   the rationale before the row is considered done.
4. If any disposition introduces a behavior change beyond what Core specifies,
   write an ADR in `decisions/`.
5. Attach the exported markdown to the port PR.

## Things that are not decisions

These are determined by the framework, not negotiated per component:

- Event names follow the policy in
  [`contract-model.md`](./contract-model.md#event-naming-policy).
- Controlled/uncontrolled prop names follow the policy in
  [`contract-model.md`](./contract-model.md#state-model-policy).
- Compound parts are reached only through the root.
- Render-override props are forbidden on new ports.
- The `tk-*` class on a slot is non-negotiable; consumer overrides append.

If a component port wants to break one of these, the path is an ADR, not a
unilateral decision sheet entry.

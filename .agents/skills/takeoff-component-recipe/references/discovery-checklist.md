# Discovery checklist

Use this checklist before writing a component recipe. Mark each item as `Found`,
`Not found`, `Unknown`, or `Not applicable`.

## Repo cut-off

For each repo:

- Repo path
- Branch
- Last commit
- Dirty files
- Worktree/symlink notes
- Files that must not be touched because another change is in-flight

## takeoff-ui core — read-only contract source

Expected path:

```text
{{repo_root}}/takeoff-ui/packages/core/src/components/tk-{{component}}/
```

Collect:

- Main component file: `tk-{{component}}.tsx`.
- Related part files: `tk-{{component}}-*`.
- SCSS files in or near the component folder.
- Props and defaults.
- Reflected attributes and internal state names.
- Events, especially `tk-...-change` events.
- Slots and named slot semantics.
- Host classes and modifier classes.
- `Host` data attributes and attribute levels.
- Disabled, open/closed, selected, active, focused, orientation, size, type,
  mode, arrow, icon, and variant behavior.
- Any backwards-compatible alias or deprecated naming.

Questions:

- Which prop names must React preserve exactly?
- Which event names map to React callbacks?
- Which slots should become public compound parts?
- Which visual-only pieces should remain internal-only?
- Which defaults must be matched by `takeoff-spar`?

## spar primitive — headless behavior source

Expected path:

```text
{{repo_root}}/spar/packages/spar/src/components/{{spar_primitive}}/
```

Collect:

- Exported components/parts.
- Exported public types.
- Controlled and uncontrolled props.
- Value vocabulary: scalar, array, key, index, level, orientation, direction,
  etc.
- Context hooks and provider shape.
- State ownership boundaries.
- A11y attributes provided by primitive.
- Keyboard navigation behavior.
- Focus management behavior.
- SSR and `useId` usage.
- `forceMount`, `hidden`, `hidden=until-found`, and mounted/unmounted behavior.
- Existing tests and what they cover.

Questions:

- Can wrapper map directly without duplicating state?
- Is there any real primitive bug that requires a minimal spar change?
- Does primitive expose parts that should not be public in `takeoff-spar`?
- Are there naming/value mismatches with `takeoff-ui core`?

## takeoff-design — recipe selector source

Expected paths:

```text
{{repo_root}}/takeoff-design/packages/tokens/styles/recipes/_{{component}}.scss
{{repo_root}}/takeoff-design/packages/tokens/tokens/component/{{component}}.json
```

Collect:

- Canonical root class.
- Canonical part classes.
- State data attributes.
- Variant data attributes.
- Required selector levels: root, item, trigger, content, icon, indicator, etc.
- Open/closed/disabled/selected/active/focus selectors.
- Size/type/mode/orientation selectors.
- Token names only when they affect required DOM structure.

Questions:

- Which selectors are mandatory for styling to work?
- Does the current or proposed wrapper DOM match recipe selectors?
- Does recipe expect data attributes that spar/wrapper do not emit?
- Does wrapper emit data attributes that recipe does not style?

## takeoff-spar — wrapper layer

Expected path:

```text
{{repo_root}}/takeoff-spar/packages/react-spar/src/components/{{component}}/
```

Collect:

- Existing component files.
- Existing part structure.
- Existing props and public types.
- Existing tests.
- Existing docs and API config.
- Index/export pattern.
- Shared utilities for `cx`, event composition, `slotProps`, `classNames`,
  deprecation warnings, and polymorphism.
- Package-level exports.

Questions:

- Should implementation create a new wrapper or refactor the existing one?
- Which local patterns must be reused instead of inventing new conventions?
- Which tests are wrapper-specific rather than primitive-level?
- Which docs examples prove the intended compound API?

## Cross-repo contract matrix

For each row, record source, current state, target state, and decision status:

- Prop name and default
- Event mapping
- Slot to compound part mapping
- Public part name and `displayName`
- Internal-only visual part
- Value type
- Data attribute
- CSS class
- Controlled/uncontrolled behavior
- Disabled/read-only behavior
- Force mount behavior
- SSR id behavior
- A11y/keyboard responsibility
- Docs scenario
- Test scenario

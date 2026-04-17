---
name: generate-component
description: >
  Scaffold a new react-spar component. Use when the user says "generate
  component", "create component", "scaffold component", "yeni bilesen olustur",
  or names a Takeoff component that does not yet exist in
  packages/react-spar/src/components. Requires the generator script at
  packages/react-spar/scripts/generate-component.mjs.
---

# Generate Component

Scaffolds a new component in `packages/react-spar` following all project
conventions.

This scaffold is the default starting point for wrapper-first components. It is
not automatically the final architecture for overlay, disclosure, or other
compound-heavy families.

## Usage

```bash
node packages/react-spar/scripts/generate-component.mjs <PascalCaseName>
```

The script creates these files under
`packages/react-spar/src/components/<kebab-name>/`:

| File              | Purpose                                                        |
| ----------------- | -------------------------------------------------------------- |
| `<Name>.tsx`      | Component implementation (React 19 ref-as-prop, no forwardRef) |
| `<Name>Base.ts`   | Slot classes, default props via `createComponentBase`          |
| `<Name>.test.tsx` | Tests including vitest-axe a11y check                          |
| `types.ts`        | Public TypeScript types                                        |
| `index.ts`        | Barrel export                                                  |

It also auto-updates:

- `src/components/index.ts` (adds barrel export)
- `src/styling/slot-registry.ts` (mirrors slot classes into the internal
  inventory)

If the component later needs public compound parts, add the extra part, context,
or adapter files deliberately instead of forcing the initial scaffold to cover
every architecture up front.

## After scaffolding

1. Decide whether the component stays wrapper-first or needs a richer
   customization surface (`slotProps`, render overrides, or public compound
   parts). Use `$takeoff-component-port` for that decision pass when the answer
   is not obvious.
2. Edit `types.ts` to define the real props interface (the scaffold uses a
   minimal `div`-based stub).
3. Edit `<Name>Base.ts` to add the actual slots and default props.
4. Implement the component in `<Name>.tsx` - wire up the spar primitive if one
   exists.
5. Expand `<Name>.test.tsx` with component-specific tests.
6. Verify:
   ```bash
   pnpm --filter @takeoff-ui/react-spar check-types
   pnpm --filter @takeoff-ui/react-spar test
   pnpm --filter @takeoff-ui/react-spar build
   ```

## Conventions enforced by the scaffold

- React 19: `ref` as regular prop, no `forwardRef`
- `data-slot="root"` on root element
- `tk-<kebab-name>` class prefix
- `createComponentBase` for slot/class/default management
- vitest-axe `toHaveNoViolations` a11y baseline test
- Mirrored into `src/styling/slot-registry.ts` so the package owns one typed
  inventory of every shipped slot class
- Compound families still require a deliberate follow-up architecture pass

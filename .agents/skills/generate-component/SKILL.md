---
name: generate-component
description: >
  Scaffold a new react-spar component. Use when the user says "generate
  component", "create component", "scaffold component", "yeni bilesen olustur",
  or names a Takeoff component that does not yet exist in
  packages/react-spar/src/components.
compatibility: >
  Requires packages/react-spar to exist with the generator script at
  packages/react-spar/scripts/generate-component.mjs.
metadata:
  owner: takeoff-ui
  version: '1'
---

# Generate Component

Scaffolds a new component in `packages/react-spar` following all project
conventions.

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
- `src/theme/recipes.ts` (registers slot classes)

## After scaffolding

1. Edit `types.ts` to define the real props interface (the scaffold uses a
   minimal `div`-based stub).
2. Edit `<Name>Base.ts` to add the actual slots and default props.
3. Implement the component in `<Name>.tsx` - wire up the spar primitive if one
   exists.
4. Expand `<Name>.test.tsx` with component-specific tests.
5. Verify:
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
- Registered in `recipes.ts` for token consumption

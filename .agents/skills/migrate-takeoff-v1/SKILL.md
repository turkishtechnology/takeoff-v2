---
name: migrate-takeoff-v1
description:
  'Migrate React applications from @takeoff-ui/react v1 and Tk* components to
  @takeoff-ui/react-spar v2. Use for migrate from takeoff-ui v1, TkButton,
  @takeoff-ui/react, upgrade to react-spar, or v1 to v2 work.'
---

# Migrate Takeoff UI v1 to v2

Use this skill for an incremental migration of a React v1 consumer to
`@takeoff-ui/react-spar`. It maps v1 intent to v2 entry points; it does not
restate v2 APIs. Every rewrite must read the target component's own
`takeoff-<name>` skill because that skill is authoritative for current v2 props,
slots, accessibility, and examples.

This skill is for React consumers only. Vue and Angular v1 consumers need a
rewrite rather than this migration path.

## Agent-led migration

This migration is agent-led. Do not ask teams to manually repeat the inventory,
mapping, prop translation, and verification for every screen. The assistant
takes the inventory, groups work by screen, migrates one bounded screen per
change, runs the focused checks, and presents the diff and remaining gaps for
human review. A developer still owns the product decision for visual behavior,
gap handling, and merge approval.

Consumers get this skill from their own `node_modules`, so no checkout of the v2
repository is needed:

```bash
ls node_modules/@takeoff-ui/react-spar/agents/migrate-takeoff-v1/
```

## Workflow

### 1. Inventory

Run the inventory commands in [references/inventory.md](references/inventory.md)
against the consumer source directory. They are plain `rg` searches — no script
to install — and they cover the React version, v1 imports, `Tk*` components by
blast radius, `onTk*` handlers, raw `<tk-*>` elements, and v1 styling
dependencies.

Read the results before editing, and use them to size the migration. Buckets
come from [references/component-map.md](references/component-map.md), so a new
mapping or a closed gap is recorded there;
[references/gaps.md](references/gaps.md) carries the per-gap guidance, and
`pnpm gen:migration-map:check` fails if the two gap lists disagree.

### 2. One-time setup

Apply the app-wide changes in [references/setup.md](references/setup.md). React
19, token CSS, provider wiring, and CSS import order are prerequisites for
migrated screens. Keep v1 and v2 installed together while screens are migrated.

### 3. Migrate leaf-first

For each screen, the assistant should:

1. Identify the screen's v1 imports, props, handlers, and styling signals.
2. Find each component row in
   [references/component-map.md](references/component-map.md).
3. For a direct or compound target, open the target `takeoff-<name>` skill and
   use its API as the source of truth.
4. Use [references/props-events.md](references/props-events.md) only for the
   v1-to-v2 intent and event translation.
5. Apply the recurring rewrites in
   [references/patterns.md](references/patterns.md).
6. Migrate leaf content before parents, then run the consumer's typecheck and
   focused tests.
7. Report the changed files, checks, unresolved gaps, and any behavior that
   needs human review before moving to the next screen.

Never migrate from memory of v1 prop names. The v2 API belongs to the component
skill and may intentionally differ from v1.

Recommended request to the assistant:

```text
migrate v1 ./src
```

For a large app, follow up with one bounded screen or route at a time, for
example `migrate the /settings screen from the inventory`. Do not let the
assistant silently replace a gap component or remove the v1 packages early.

### 4. Decide the gaps

For every gap in [references/gaps.md](references/gaps.md), explicitly choose:
keep the v1 component side-by-side, build an app-local replacement, or defer
that screen. Do not remove v1 packages while a gap or raw custom element
remains.

### 5. Verify

After each screen, run the consumer typecheck and its focused tests. At the end:

- rerun the inventory commands and confirm only intentional gap allowlist usage
  remains;
- confirm no migrated file imports v1 components or reads `CustomEvent.detail`;
- test light and dark mode, keyboard interaction, form validation, and overlays;
- remove v1 packages only once the finish criteria in
  [references/inventory.md](references/inventory.md) are met.

## References

- [Inventory commands](references/inventory.md)
- [Component map](references/component-map.md)
- [Props and events](references/props-events.md)
- [Setup](references/setup.md)
- [Recurring patterns](references/patterns.md)
- [Known gaps](references/gaps.md)
- Styling contract:
  `.agents/skills/takeoff-ui/references/composition-styling.md`

The generated v2 coverage section in the component map is refreshed from
`packages/react-spar/src/components/` by `pnpm gen:migration-map`. Run
`pnpm gen:migration-map:check` in CI to detect a newly shipped component that
has not been reviewed for v1 migration coverage.

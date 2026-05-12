# Local evidence protocol for recipe generation

The recipe must be based on the user's local checkout, not memory.

## Required sources

| Source           | Required paths                                                                                                         | Purpose                                                              |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| `takeoff-ui`     | `packages/core/src/components/tk-{{component}}/**`                                                                     | Legacy/source API, events, slots, classes, attrs                     |
| `spar`           | `packages/spar/src/components/{{spar_primitive}}/**`                                                                   | Headless behavior, exported parts, tests, a11y, keyboard, focus, SSR |
| `takeoff-design` | `packages/tokens/styles/recipes/_{{component}}.scss`; `packages/tokens/tokens/component/{{component}}.json` if present | CSS recipe selectors, tokens, data attr expectations                 |
| `takeoff-spar`   | `packages/react-spar/src/components/{{component}}/**`; docs/API/export patterns                                        | Existing wrapper, tests, docs, local conventions                     |

## Minimum local snapshot

Record for all four repos:

```bash
git branch --show-current
git status --short
git log -1 --oneline
```

Record missing repo or file as `Not found`. Do not replace missing evidence with
assumptions.

## Acceptable evidence

Use short excerpts, line ranges when available, and file paths. Long file dumps
are discouraged. A useful evidence note should answer:

- what was observed,
- where it was observed,
- why it affects the recipe,
- whether it is direct, derived, unknown, or contradicted.

## Stop conditions

Stop with `STOP: LOCAL_EVIDENCE_REQUIRED` when no local repo evidence is
available.

Stop with `STOP: CONTRACT_SOURCE_MISSING` when `takeoff-ui core` is missing and
the user has not approved creating a wrapper without legacy source contract.

Stop with `STOP: DESIGN_CONTRACT_UNKNOWN` when design selectors are missing and
the component's public DOM/classes/data-state cannot be derived safely.

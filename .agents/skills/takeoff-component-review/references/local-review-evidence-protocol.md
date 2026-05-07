# Local review evidence protocol

A merge-readiness review must use current local evidence, because the
implementation may differ from the recipe or the recipe may be stale.

## Evidence to collect

1. Repo cut-off for `takeoff-ui`, `spar`, `takeoff-design`, and `takeoff-spar`.
2. Working tree and staged diff/name-status from all repos.
3. Component-relevant local source excerpts from all four repos.
4. Approved recipe and decisions.
5. Validation logs.

## Allowed and conditional scopes

Allowed by default:

- `takeoff-spar/packages/react-spar/src/components/{{component}}/**`
- component-specific docs/API/test/export files following existing repo pattern

Conditional with justification:

- `spar/packages/spar/src/components/{{spar_primitive}}/**` for real primitive
  gaps
- `takeoff-design/packages/tokens/styles/recipes/_{{component}}.scss`
- `takeoff-design/packages/tokens/tokens/component/{{component}}.json`

Forbidden:

- `takeoff-ui` component source
- generic infra, task generators, audit/migration scaffolding, workflows,
  unrelated components

## Review evidence quality

Each issue should cite one or more of:

- diff file path and excerpt,
- recipe row or decision ID,
- local source path and excerpt,
- validation command/result excerpt,
- existing pattern file path.

Do not accept “I checked” claims without an artifact.

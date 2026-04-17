---
title: Architectural Decision Records
status: canonical
updated: 2026-04-17
---

# Architectural Decision Records

This directory records durable architectural decisions for `takeoff-spar`.

It complements:

- [`../contract-model.md`](../contract-model.md) — what the library promises
- [`../api-decision-framework.md`](../api-decision-framework.md) — how
  per-component API shapes are decided

An ADR lives here when a choice:

- affects more than one component
- constrains future design or engineering decisions
- would surprise a contributor who did not witness the discussion

Single-component design notes belong with the component in its port review
artifacts, not here.

## Format

Every ADR starts with frontmatter:

- `number` — monotonically increasing four-digit identifier
- `title` — short imperative title
- `status` — `proposed`, `accepted`, or `superseded by ADR-XXXX`
- `date` — `YYYY-MM-DD` the decision entered its current status
- `tags` — free-form labels for search

Body sections:

- **Context** — forces that make the decision necessary
- **Decision** — a single declarative statement ("We will …")
- **Consequences** — what becomes easier, what becomes harder, what is now
  forbidden
- **References** — links to code, proposals, or discussions

Keep each ADR short. A reader should absorb it in under two minutes.

## Index

| ADR                                                          | Title                                                                | Status   |
| ------------------------------------------------------------ | -------------------------------------------------------------------- | -------- |
| [0001](./0001-react-19-only.md)                              | React 19-only peer range                                             | accepted |
| [0002](./0002-no-bundled-component-css.md)                   | No bundled component CSS                                             | accepted |
| [0003](./0003-spar-as-runtime-primitive.md)                  | Spar is the sole runtime primitive layer                             | accepted |
| [0004](./0004-takeoff-ui-core-reference-only.md)             | `takeoff-ui/core` is a parity reference, not a dependency            | accepted |
| [0005](./0005-slot-class-data-attribute-styling-contract.md) | Slot classes and `data-*` attributes are the public styling contract | accepted |
| [0006](./0006-docs-site-non-strict-tsconfig.md)              | Docs site type-checks under the shipped `@docusaurus/tsconfig`       | accepted |
| [0007](./0007-provider-display-contents-invariant.md)        | `SparReactProvider` locks `display: contents` on its wrapper         | accepted |
| [0008](./0008-path-aliases-over-project-references.md)       | Path aliases over TypeScript project references                      | accepted |

## Lifecycle

- New ADRs take the next unused number and start as `proposed`.
- Merge to the default branch moves them to `accepted`.
- Changing an accepted decision means a new ADR that supersedes the previous
  one. Do not rewrite accepted ADRs in place beyond clerical fixes.
- When an ADR is superseded, update the superseded entry's frontmatter and the
  index above.

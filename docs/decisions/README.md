# Architecture Decision Records

Repo-wide decisions that shape `@takeoff-ui/react-spar`. ADRs override
[`contract-model.md`](../contract-model.md) and
[`component-architecture.md`](../component-architecture.md) when more recent.

## Index

| ID       | Title                                                                         | Status   | Supersedes |
| -------- | ----------------------------------------------------------------------------- | -------- | ---------- |
| ADR-0001 | [Package dependency strategy](./0001-package-dependency-strategy.md)          | accepted | —          |
| ADR-0002 | [Compound export policy](./0002-compound-export-policy.md)                    | accepted | —          |
| ADR-0003 | [Spar delegation rule](./0003-spar-delegation-rule.md)                        | accepted | —          |
| ADR-0004 | [No render-override props](./0004-no-render-overrides.md)                     | accepted | —          |
| ADR-0005 | [Provider `display: contents` invariant](./0005-provider-display-contents.md) | accepted | —          |
| ADR-0006 | [`ComponentsThemeMap` typing bridge](./0006-component-theme-typing-bridge.md) | accepted | —          |

## Authoring rules

- One decision per file. ADRs are short. If an ADR is more than ~150 lines, it
  is probably more than one decision.
- Filenames are `<NNNN>-<kebab-case-title>.md`.
- IDs are sequential, never reused.
- Status is one of: `proposed`, `accepted`, `superseded`, `withdrawn`.
- A superseded ADR keeps its file and links forward to the replacement; the
  replacement links back via "Supersedes" in the index.
- Withdrawn ADRs (proposed but never accepted) keep their file with status
  flipped to `withdrawn`.
- Cross-component architectural choices belong here. Single-component port notes
  belong with the component.

## Template

Use this scaffold when adding an ADR. Keep prose terse and decision-oriented.

```md
# ADR-NNNN: <title>

- Status: proposed | accepted | superseded | withdrawn
- Date: YYYY-MM-DD
- Supersedes: ADR-NNNN | none
- Superseded by: ADR-NNNN | none

## Context

What is the problem? What constraints, prior decisions, and tradeoffs make this
decision necessary now? Two paragraphs at most.

## Decision

The chosen path, in plain language. One paragraph.

## Consequences

- What becomes easy.
- What becomes hard or expensive.
- What we are giving up.
- What this commits us to maintaining.

## Alternatives considered

For each alternative, one or two sentences on why it lost.

## References

Links to related ADRs, docs, PRs, issues.
```

## When to write one

Write an ADR before merging when any of the following is true:

- The change affects more than one component or the shared customization
  contract.
- The change introduces a public surface that no Core or Spar source provides.
- The change establishes a policy that the readiness gate or contract model will
  refer to.
- The change reverses or narrows a prior policy.

For single-component decisions whose scope is the component's API surface, the
decision sheet (`tools/<component>-api-alignment.html`) is the right artifact,
not an ADR.

# Review reasoning gates

Use these gates to make review skeptical and evidence-backed. Do not output
hidden chain-of-thought. Output only the observable review self-check table and
issues.

## Verdict limits

- No local source evidence from all four repos: maximum verdict is
  `CONDITIONAL`.
- Missing diff or touched-file evidence: maximum verdict is `CONDITIONAL`;
  `FAIL` if the final report claims changes that cannot be checked.
- Missing recipe/decision evidence: maximum verdict is `CONDITIONAL`; `FAIL` if
  public API, DOM/data-state, or state ownership may have drifted.
- Related validation failure: `FAIL`.
- Forbidden scope change: `FAIL`.

## Required review self-check rows

| id    | Question                                                                 | Evidence                               | Unsafe outcome                          |
| ----- | ------------------------------------------------------------------------ | -------------------------------------- | --------------------------------------- |
| V-Q01 | Did I refresh local repo cut-off for all four repos?                     | local evidence JSON or source excerpts | Max `CONDITIONAL`                       |
| V-Q02 | Are touched files allowed, conditional with justification, or forbidden? | diff/name-status                       | Block forbidden scope                   |
| V-Q03 | Does public API match core + recipe + approved decisions?                | source + recipe + diff                 | Block or major issue                    |
| V-Q04 | Do events and payloads match core + recipe?                              | source + diff/tests                    | Block if consumer contract wrong        |
| V-Q05 | Does wrapper avoid spar-owned state/a11y/keyboard/focus/SSR behavior?    | primitive source + wrapper diff        | Block responsibility inversion          |
| V-Q06 | Do classes/data attrs match design selectors at correct DOM levels?      | design source + wrapper diff/tests     | Block design contract break             |
| V-Q07 | Are exports, public types, refs, and displayNames complete?              | diff/tests/types                       | Major/blocker depending impact          |
| V-Q08 | Are docs/tests aligned with recipe and not testing spar internals?       | diff/final report                      | Major/minor                             |
| V-Q09 | Did validation run and are failures triaged?                             | logs                                   | Conditional/fail                        |
| V-Q10 | What evidence could make this verdict wrong, and was it checked?         | review notes                           | Lower confidence or conditional verdict |

## Counterexample pass

Before final verdict, deliberately look for:

1. A hidden scope change outside component folders.
2. An invented prop, event, or data attr not in the recipe/core/design.
3. Wrapper state or keyboard code that should live in spar.
4. A missing export/type that docs hide.
5. A validation failure dismissed without proof.

Record findings as issues or `Good / confirmed` with evidence.

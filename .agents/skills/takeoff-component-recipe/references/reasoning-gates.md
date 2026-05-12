# Recipe reasoning gates

Use these gates to make the recipe evidence-first and self-correcting. Do not
output hidden chain-of-thought. Output only the observable result: question,
answer, evidence, status, and follow-up.

## Gate statuses

- `pass`: checked against local evidence and safe to use.
- `decision-needed`: multiple valid options or missing policy input.
- `unknown`: searched but evidence is absent or insufficient.
- `contradicted`: sources disagree.
- `blocked`: cannot proceed without source access or an approved decision.

## Required recipe self-check rows

| id    | Question                                                                            | Expected evidence                                           | Unsafe outcome                                                     |
| ----- | ----------------------------------------------------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------ |
| R-Q01 | Did I inspect local `takeoff-ui core` files for this component?                     | File paths, excerpts, prop/event/slot/class findings        | Stop or mark recipe not ready                                      |
| R-Q02 | Are all proposed React prop names traceable to core or an approved decision?        | API rows with source/evidence IDs                           | Convert unsupported props to `Decision Needed`                     |
| R-Q03 | Are all event names/payloads traceable to core?                                     | Event rows and payload evidence                             | Block implementation of payload-specific behavior                  |
| R-Q04 | Did I inspect local `spar` primitive files and tests?                               | Exports, state vocabulary, a11y/keyboard/focus/SSR evidence | Do not assert spar compatibility                                   |
| R-Q05 | Would the wrapper plan duplicate spar-owned state/a11y/keyboard/focus/SSR behavior? | Compatibility matrix and diff-free plan                     | Mark as `Spar gap` or block                                        |
| R-Q06 | Did I inspect local `takeoff-design` recipe/tokens?                                 | Selector/class/data-attr evidence                           | Do not invent DOM/data-state contract                              |
| R-Q07 | Are all classes/data attributes tied to the correct DOM level?                      | DOM contract table with source paths/lines                  | Mark `Design gap` or `Decision Needed`                             |
| R-Q08 | Did I inspect existing `takeoff-spar` wrapper conventions?                          | Local examples/pattern paths                                | Do not invent `slotProps`, `classNames`, export, or event patterns |
| R-Q09 | Did I search for contradictions between core, spar, design, and wrapper?            | Contradiction table                                         | Do not choose silently                                             |
| R-Q10 | Did I convert unsupported assumptions to decisions/risks?                           | Decision IDs linked from ledger rows                        | Recipe not ready                                                   |

## The self-correction pass

After drafting the recipe, run a short adversarial pass:

1. Find the most likely invented API or DOM attr.
2. Find the most likely wrapper responsibility leak.
3. Find the most likely stale pattern from existing `takeoff-spar` components.
4. Find the highest-impact unknown.
5. Revise the recipe or add a decision/risk for each item.

Record only the outcome, not private reasoning.

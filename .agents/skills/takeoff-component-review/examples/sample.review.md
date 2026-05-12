# ExampleComponent implementation review

## Verdict

**PASS WITH NOTES** — Heuristic review generated from provided artifacts.
Complete the semantic source checks before merge.

## Evidence reviewed

| artifact        | status             | notes                             |
| --------------- | ------------------ | --------------------------------- |
| recipe          | present            | evidenceLedger present            |
| decisions       | missing/not needed |                                   |
| diff            | present            |                                   |
| local evidence  | present            | Required for PASS/PASS WITH NOTES |
| final report    | missing            |                                   |
| validation logs | present            |                                   |

## Reviewer self-checks

| id    | question                                              | status | answer                                                               | evidence      | followUp                                  |
| ----- | ----------------------------------------------------- | ------ | -------------------------------------------------------------------- | ------------- | ----------------------------------------- |
| V-Q01 | Did I refresh local repo cut-off for all four repos?  | pass   | Sample evidence contains all four repos.                             | repos         | None                                      |
| V-Q02 | Are touched files allowed, conditional, or forbidden? | pass   | Sample touched files are component-scoped.                           | touchedFiles  | None                                      |
| V-Q03 | Does public API match source-backed recipe?           | pass   | Sample diff is consistent with sample recipe at the heuristic level. | recipe + diff | Manual semantic review still recommended. |

## Blocking issues

None.

## Major issues

None.

## Minor issues

None.

## Nits

None.

## Good / confirmed

- Local evidence is present for takeoff-ui core, spar, takeoff-design, and
  takeoff-spar.
- Diff references canonical class prefix tk-example-component.
- Compound `Object.assign` pattern appears in diff.
- displayName appears in diff.
- All expected validation commands are mentioned in provided evidence.

## Contract coverage matrix

| area                  | status         | evidence                           | notes                                                  |
| --------------------- | -------------- | ---------------------------------- | ------------------------------------------------------ |
| Local source evidence | reviewed       | local evidence JSON                | No PASS without local source-of-truth evidence.        |
| Scope                 | reviewed       | diff/local touched files           | Forbidden path scan performed.                         |
| Public API            | needs evidence | recipe/core/final report/diff      | Requires semantic review against source-backed recipe. |
| Compound              | reviewed       | diff                               | Heuristic only.                                        |
| DOM contract          | reviewed       | diff + takeoff-design local source | Confirm levels/data attrs manually.                    |
| Spar responsibility   | reviewed       | diff + spar local source           | Heuristic duplication scan.                            |
| Tests/docs/exports    | needs evidence | final report/diff                  | Manual review required.                                |
| takeoffUi             | present        | 1 local file(s)                    | from local evidence JSON                               |
| spar                  | present        | 1 local file(s)                    | from local evidence JSON                               |
| takeoffDesign         | present        | 1 local file(s)                    | from local evidence JSON                               |
| takeoffSpar           | present        | 1 local file(s)                    | from local evidence JSON                               |

## Validation assessment

| command                                | result    | triage         | notes |
| -------------------------------------- | --------- | -------------- | ----- |
| pnpm install                           | mentioned | Evidence found |       |
| pnpm exec vitest run example-component | mentioned | Evidence found |       |
| pnpm exec vitest run                   | mentioned | Evidence found |       |
| pnpm exec tsc --noEmit                 | mentioned | Evidence found |       |
| pnpm exec eslint .                     | mentioned | Evidence found |       |
| pnpm build                             | mentioned | Evidence found |       |

## Decision follow-up

- Complete reviewSelfChecks and confirm approved decisions manually before final
  merge verdict.

## Recommended next action

Address blocker/major issues, attach missing evidence, complete skeptical
passes, then rerun this review.

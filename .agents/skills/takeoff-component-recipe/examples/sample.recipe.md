# ExampleComponent component recipe

## 1. Inputs

| Field           | Value                        |
| --------------- | ---------------------------- |
| component       | example-component            |
| componentPascal | ExampleComponent             |
| sparPrimitive   | example-primitive            |
| repoRoot        | /Users/U_TURAN4/Desktop/http |
| generatedAt     | 2026-05-07T00:00:00Z         |

**Summary:** Example only. Replace every row with facts discovered from
takeoff-ui core, spar, takeoff-design, and takeoff-spar.

## 2. Repo cut-off

| Repo           | Path                                        | Branch | Commit         | Dirty | Files / notes                                                                                                             |
| -------------- | ------------------------------------------- | ------ | -------------- | ----- | ------------------------------------------------------------------------------------------------------------------------- |
| takeoff-ui     | /Users/U_TURAN4/Desktop/http/takeoff-ui     | main   | abc123 Example | clean | None                                                                                                                      |
| spar           | /Users/U_TURAN4/Desktop/http/spar           | main   | def456 Example | clean | None                                                                                                                      |
| takeoff-design | /Users/U_TURAN4/Desktop/http/takeoff-design | main   | ghi789 Example | dirty | M packages/tokens/styles/recipes/\_example-component.scss; Example dirty file; do not overwrite unrelated in-flight work. |
| takeoff-spar   | /Users/U_TURAN4/Desktop/http/takeoff-spar   | main   | jkl012 Example | clean | None                                                                                                                      |

## 3. Discovery summary

### takeoff-ui core

**Files**

- `packages/core/src/components/tk-example-component/tk-example-component.tsx`

**Findings**

- Prop names and defaults must be extracted from core.
- Event tk-example-component-change maps to React handler naming.

### spar primitive

**Files**

- `packages/spar/src/components/example-primitive/index.ts`

**Findings**

- Primitive owns state, keyboard, focus, and SSR id behavior.

### takeoff-design

**Files**

- `packages/tokens/styles/recipes/_example-component.scss`

**Findings**

- Recipe requires canonical root and part classes plus state data attributes.

### takeoff-spar

**Files**

- `packages/react-spar/src/components/example-component/index.ts`

**Findings**

- Wrapper should follow existing component export and test patterns.

## 4. Evidence & self-check gates

The recipe must be based on local evidence. These rows show the observable
self-check result, not hidden chain-of-thought.

### Self-checks

| ID    | Question                                                               | Status          | Answer                                                               | Evidence          | Follow-up                                   |
| ----- | ---------------------------------------------------------------------- | --------------- | -------------------------------------------------------------------- | ----------------- | ------------------------------------------- |
| R-Q01 | Did I inspect local takeoff-ui core files?                             | pass            | Example says yes; replace with real local file evidence.             | E001              | None                                        |
| R-Q02 | Are proposed React prop names traceable to core or approved decisions? | pass            | value is supported by core; defaultValue is wrapper mapping to spar. | E001,E002         | Keep names aligned.                         |
| R-Q03 | Are event names/payloads traceable to core?                            | decision-needed | Event name is traceable; payload shape is not confirmed.             | E005              | Resolve D001 before payload-specific tests. |
| R-Q04 | Did I inspect spar primitive exports/tests/headless behavior?          | pass            | Example evidence says primitive owns behavior.                       | E002              | Do not duplicate state/keyboard.            |
| R-Q05 | Would wrapper duplicate spar-owned behavior?                           | pass            | Plan maps names/classes only.                                        | sparCompatibility | No custom keyboard/state.                   |
| R-Q06 | Did I inspect takeoff-design selectors/tokens?                         | pass            | Example selector evidence found.                                     | E003              | Use DOM contract table.                     |
| R-Q07 | Did I inspect takeoff-spar wrapper conventions?                        | pass            | Example wrapper pattern evidence found.                              | E004              | Reuse existing patterns.                    |
| R-Q08 | Did I search for contradictions?                                       | pass            | No contradictions in sample.                                         | contradictions    | None                                        |
| R-Q09 | Did I convert unsupported assumptions to decisions/risks?              | pass            | Payload unknown became D001.                                         | D001              | Resolve before implementation.              |

### Evidence ledger

| ID   | Claim                                                                            | Repo           | Path                                                                       | Lines   | Status          | Confidence | Decision |
| ---- | -------------------------------------------------------------------------------- | -------------- | -------------------------------------------------------------------------- | ------- | --------------- | ---------- | -------- |
| E001 | Core exposes value prop and change event naming source.                          | takeoff-ui     | packages/core/src/components/tk-example-component/tk-example-component.tsx | 10-44   | Direct evidence | High       | Unknown  |
| E002 | Spar primitive owns controlled/uncontrolled state and keyboard behavior.         | spar           | packages/spar/src/components/example-primitive/index.ts                    | 1-120   | Direct evidence | High       | Unknown  |
| E003 | Design recipe requires tk-example-component root and data-size selector.         | takeoff-design | packages/tokens/styles/recipes/\_example-component.scss                    | 5-35    | Direct evidence | High       | Unknown  |
| E004 | takeoff-spar wrapper should use existing className and compound export patterns. | takeoff-spar   | packages/react-spar/src/components/example-component/index.ts              | 1-80    | Derived         | Medium     | Unknown  |
| E005 | Event payload shape is not confirmed.                                            | takeoff-ui     | packages/core/src/components/tk-example-component/tk-example-component.tsx | Unknown | Unknown         | Low        | D001     |

### Contradictions

_No rows recorded._

### Assumptions under watch

| ID   | Assumption                                               | Evidence | Status          | Decision |
| ---- | -------------------------------------------------------- | -------- | --------------- | -------- |
| A001 | Event payload detail may include value and source event. | E005     | decision-needed | D001     |

## 5. Source contract matrix

Use the API, event, compound, DOM, and spar tables below as the contract matrix.
Each row should carry source evidence or `Unknown`.

### Additional content / evidence blocks

### Rich content block examples

The template can render structured evidence, not just fixed recipe tables.

| Block type | Use case                                                | Status    |
| ---------- | ------------------------------------------------------- | --------- |
| code       | API examples, event payload snippets, selector snippets | supported |
| table      | Contract comparisons and validation matrices            | supported |
| callout    | Blockers, warnings, approved decisions                  | supported |
| fileTree   | Implementation files and public export shape            | supported |

### Example implementation file map

### packages/react-spar/src/components/example-component

```json
{
  "name": "packages/react-spar/src/components/example-component",
  "children": ["index.tsx", "example-component.test.tsx", "types.test-d.ts"]
}
```

### apps/docs/docs/components

```json
{
  "name": "apps/docs/docs/components",
  "children": ["example-component.mdx", "example-component.api.config.mjs"]
}
```

### Readiness checklist

- [ ] Core prop names verified — planned
- [ ] Event payload shape approved — Decision Needed
- [ ] Design selectors matched to wrapper DOM — planned

### Optional raw evidence summary

- Keep source snippets short.
- Prefer tables for API and DOM matrices.
- Use decisions for unresolved choices.

## 6. Public React API proposal

| Name         | Type   | Default   | Source          | Status          | Notes                            |
| ------------ | ------ | --------- | --------------- | --------------- | -------------------------------- |
| value        | string | undefined | takeoff-ui core | proposed        | Example controlled prop row.     |
| defaultValue | string | undefined | spar primitive  | wrapper mapping | Initial-only uncontrolled value. |

### Events

| Web component               | React                    | Payload | Source          | Status          | Notes                                        |
| --------------------------- | ------------------------ | ------- | --------------- | --------------- | -------------------------------------------- |
| tk-example-component-change | onExampleComponentChange | unknown | takeoff-ui core | decision needed | Confirm payload shape before implementation. |

## 7. Compound structure

- Root: `ExampleComponent`
- Tree:
  `ExampleComponent > ExampleComponent.Item > ExampleComponent.Trigger + ExampleComponent.Content`

### Public parts

| Part                     | Element | displayName              | Public | Source                |
| ------------------------ | ------- | ------------------------ | ------ | --------------------- |
| ExampleComponent.Item    | div     | ExampleComponent.Item    | True   | core slot / spar part |
| ExampleComponent.Trigger | button  | ExampleComponent.Trigger | True   | core slot / spar part |

### Internal-only parts

| Name      | Reason                                                            |
| --------- | ----------------------------------------------------------------- |
| Indicator | Visual-only until a public customization requirement is approved. |

## 8. DOM / class / data-state contract

| Level | Class                     | Data attr         | Values               | Required | Source                | Status  | Notes                                                      |
| ----- | ------------------------- | ----------------- | -------------------- | -------- | --------------------- | ------- | ---------------------------------------------------------- |
| root  | tk-example-component      | data-size         | small, medium, large | True     | takeoff-design recipe | planned | Canonical class must be preserved with consumer className. |
| item  | tk-example-component-item | data-state='open' | true, false          | True     | takeoff-design recipe | planned | Source level must be confirmed.                            |

## 9. Spar compatibility

| Capability                    | Spar                 | takeoff-spar wrapper                                | Status          | Resolution                                                 |
| ----------------------------- | -------------------- | --------------------------------------------------- | --------------- | ---------------------------------------------------------- |
| controlled/uncontrolled value | Supported            | Normalize to takeoff-ui-compatible prop/event names | Wrapper mapping | No duplicate state in wrapper.                             |
| indicator visibility          | Internal part exists | Expose as visual prop only                          | Decision Needed | Needs API decision if customization must be more flexible. |

## 10. takeoff-design alignment

- Recipe requires canonical root and part classes plus state data attributes.

## 11. takeoff-spar implementation plan

| Area  | Action                                                        | Files                                                             |
| ----- | ------------------------------------------------------------- | ----------------------------------------------------------------- |
| types | Export root and public part props plus value and event types. | packages/react-spar/src/components/example-component/index.ts     |
| tests | Add wrapper DOM contract and type tests.                      | packages/react-spar/src/components/example-component/**tests**/\* |

## 12. Tests and docs plan

### Tests

| Name         | Coverage                                   | Status  |
| ------------ | ------------------------------------------ | ------- |
| DOM contract | canonical class and data attribute mapping | planned |
| displayName  | root and public compound parts             | planned |

### Docs

| Name       | Status  | Notes                            |
| ---------- | ------- | -------------------------------- |
| Default    | planned | LiveCode demo with compound API. |
| Controlled | planned | Show controlled React API.       |

## 13. Validation plan

| Command                                | Required | Notes                         |
| -------------------------------------- | -------- | ----------------------------- |
| pnpm exec vitest run example-component | True     | Component-focused validation. |
| pnpm exec tsc --noEmit                 | True     | Types.                        |

## 14. Decision Needed

### D001 — Event payload shape

- Status: needed
- Blocking: yes
- Question: Should the React change handler receive the raw web component
  payload or normalized value?
- Impact: Wrong payload would create a breaking public API.
- Evidence:
  - Core event exists but payload shape is not recorded in this example.
- Options:
  1. Expose normalized value and original event.
  2. Expose raw custom event detail.
- Recommendation: Prefer normalized value plus original event when consistent
  with existing wrappers.
- Decision: Unknown
- Follow-up:
  - Update API table and tests after approval.

## 15. Handoff prompt

Use `references/implementation-handoff.md` from this skill and replace
placeholders with this recipe's component values. Attach this recipe and the
approved decisions Markdown.

## 16. Remaining risks

| Risk                            | Mitigation                                                 | Status |
| ------------------------------- | ---------------------------------------------------------- | ------ |
| Example facts are placeholders. | Replace with source-backed findings before implementation. | open   |

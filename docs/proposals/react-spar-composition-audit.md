---
title: react-spar composition audit
status: active proposal
owner: takeoff-spar
updated: 2026-04-18
exit: >
  Absorbed once (a) the `## Composition archetypes` section has landed in
  `packages/react-spar/docs/CODING_STANDARDS.md`, (b) the single-render-tree
  bullet has landed in `docs/api-decision-framework.md § 7`, and (c) the two
  Dialog follow-up PRs (Overlay delegation, Close delegation) and the one Button
  base JSDoc follow-up have been merged or explicitly declined with a recorded
  rationale.
---

# react-spar composition audit

## Why this exists

Commit `a116e11` moved every component in `packages/react-spar` to a
compound-only surface. The compound surfaces are shaped correctly in the
abstract — root owns state, parts own structure — but each component was
compounded against a different upstream shape, and the decisions for **which
upstream parts to delegate to, which to wrap plain, and which to bypass
entirely** were never recorded.

The user framing that prompted this audit was concrete: _"it feels odd that a
`SparButton` sits inside `Button`; did anyone look at how the upstream Spar
`Button` composes?"_ The answer turns out to be interesting — `SparButton` is a
**leaf upstream** with no compound parts at all, so `Button.Label`,
`Button.LeadingIcon`, `Button.TrailingIcon`, and `Button.Spinner` are React
enhancements that have no upstream analogue. They are not wrapping anything;
they are pure structural chrome we invented so that consumers can customize
content inside canonical owner nodes without flat content props.

Once that framing is explicit, the follow-up questions fall out:

- For parts that **do** have an upstream analogue (`Dialog.Title`,
  `Input.Label`, `Accordion.Header`, …), does the wrapper delegate to the
  upstream part, or re-emit a plain tag?
- For parts that have no upstream analogue (`Button.Spinner`, `Input.Container`,
  `Dialog.Mask`, …), is that classification recorded anywhere a reviewer can
  find?
- Where the wrapper deliberately bypasses an upstream primitive (`Button`
  link-mode, `Dialog.Mask` vs `SparDialog.Overlay`, `Dialog.CloseButton` vs
  `SparDialog.Close`), is the reason on record in the file that does the bypass?

This doc inventories all five components against those questions and produces
the rule we want to codify.

## Upstream shape reference

Source: `../spar/packages/spar/src/components/*` (pinned against the commit
checked out on 2026-04-18).

| primitive       | shape    | upstream parts                                                                  | what the primitive owns that wrappers must not re-implement                                      |
| --------------- | -------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `SparButton`    | leaf     | —                                                                               | polymorphism via `as`, toggle state, Enter/Space activation on non-native, `aria-*`, `data-*`    |
| `SparCheckbox`  | leaf     | —                                                                               | tri-state `checked`, hidden-input form integration, ARIA role=checkbox, keyboard                 |
| `SparAccordion` | compound | `.Root`, `.Item`, `.Header`, `.Trigger`, `.Content`                             | item registry, roving tabindex, arrow/home/end keyboard, context, value→open reconciliation      |
| `SparDialog`    | compound | `.Root`, `.Trigger`, `.Overlay`, `.Content`, `.Title`, `.Description`, `.Close` | focus trap, modal state, overlay click-to-close, dialog ARIA labelling, close button keyboarding |
| `SparInput`     | compound | `.Root`, `.Field`, `.Label`, `.Description`, `.ErrorMessage`                    | ID coordination (`fieldId`/`labelId`/`descriptionId`/`errorId`), ARIA relationships              |

Key observation: the compound shape of `SparButton` and `SparCheckbox` is empty.
Our compound shape for those components is therefore **entirely
React-enhancement** — there is no upstream part to delegate to. By contrast,
`SparAccordion`, `SparDialog`, and `SparInput` are already compound upstream, so
each of our parts can either delegate to a matching upstream part, render plain
tags as a React enhancement, or bypass an existing upstream part (the
interesting case).

## Composition archetypes

Three archetypes surface from the audit. They are not new — they are names for
patterns that already exist in the code but have not been named in prose.

1. **Inherited part** — the wrapper's compound part renders its upstream
   counterpart. The upstream part owns the DOM tag, ARIA wiring, and any
   lifecycle; the wrapper only composes styling attrs and `children`. Example:
   `Input.Label` renders `SparInputLabel`; `Dialog.Title` renders
   `SparDialog.Title`; `Accordion.Header` renders
   `SparAccordion.Header > SparAccordion.Trigger`.

2. **React-enhancement part** — the wrapper's compound part has no upstream
   counterpart. It renders a plain HTML tag (`span`, `div`, `button`) and owns
   only `data-slot`, `tk-*` classes, and consumer-facing behavior that Spar does
   not itself provide. Classified as `react-enhancement` per
   `contract-model.md § Divergence Classification`. Example: `Button.Spinner`,
   `Input.Container`, `Input.LeadingIcon`, `Accordion.Arrow`.

3. **Bypass part** — an upstream part for the same slot exists, but the wrapper
   renders plain tags instead of delegating to it. This is the category the
   audit flags as needing explicit justification — it is the only archetype that
   risks re-implementing behavior ADR-0003 reserves for Spar. Example:
   `Dialog.Mask` vs `SparDialog.Overlay`; `Dialog.CloseButton` vs
   `SparDialog.Close`; `Button` link-mode vs `SparButton as="a"`.

The proposal's durable output is: every compound part declares which of those
three archetypes it belongs to, and bypass parts carry a one-line rationale.
Inherited parts and React-enhancement parts are cheap to review once they are
labelled; bypass parts are where the contract with Spar is actually at stake.

## Per-component audit

Each component section answers the seven review questions once.

### Button

1. **Archetype of the root.** Leaf upstream; compound in our layer via pure
   React enhancement.
2. **Primitive used.** `SparButton` (leaf). `Button.tsx:150` in button-mode
   renders `<SparButton as="button">`; `Button.tsx:115` in link-mode renders a
   bare `<a>` inside `ButtonProvider`.
3. **Public compound surface.** `Button.Label`, `Button.LeadingIcon`,
   `Button.TrailingIcon`, `Button.Spinner`.
4. **Render-tree shape.** Single tree. The root renders `{children}` and every
   part is consumer-composed inside. No part is also re-emitted by the root.
5. **Part-by-part classification.**
   - `Button.Label` → React-enhancement (`Button.tsx:176`). `SparButton` is a
     leaf; no upstream `Label`.
   - `Button.LeadingIcon` → React-enhancement (`Button.tsx:189`).
   - `Button.TrailingIcon` → React-enhancement (`Button.tsx:207`).
   - `Button.Spinner` → React-enhancement (`Button.tsx:225`). Conditional on
     `context.loading`.
6. **CODING_STANDARDS divergences.** None. The single render tree, conditional
   `Button.Spinner` behavior, and context-driven rendering all match the
   standards.
7. **Proposed fix.** Record the link-mode bypass as a `technical-adaptation` in
   `ButtonBase.ts`. `SparButton` supports `as="a"` polymorphically
   (`spar/packages/spar/src/components/Button/Button.tsx:8-24`), but the
   upstream keyboard handler preventDefaults Enter/Space on non-native elements
   (`Button/Button.tsx:79-82`), which would block a native anchor's
   Enter→navigate behavior. Rendering a bare `<a>` is the correct call; the
   intent just needs to land in the base file so the next reader does not treat
   the asymmetry as an oversight.

### Checkbox

1. **Archetype of the root.** Leaf upstream; compound in our layer via pure
   React enhancement.
2. **Primitive used.** `SparCheckbox` (leaf). `Checkbox.tsx:128` renders the
   primitive and passes `{children}` into it.
3. **Public compound surface.** `Checkbox.Indicator`, `Checkbox.Icon`,
   `Checkbox.Content`, `Checkbox.Label`, `Checkbox.Description`.
4. **Render-tree shape.** Single tree. Root renders `{children}` via
   `SparCheckbox`.
5. **Part-by-part classification.**
   - All five parts → React-enhancement (`Checkbox.tsx:155`, `:166`, `:192`,
     `:203`, `:214`). `SparCheckbox` is a leaf; no upstream analogue for any of
     them.
   - `Checkbox.Icon` uses function-as-children for render-time
     `{ checked, indeterminate }` state, which is the pattern CODING_STANDARDS
     already endorses.
6. **CODING_STANDARDS divergences.** None.
7. **Proposed fix.** Classification tag in `CheckboxBase.ts` only; no code
   change required. Kept as the canonical worked example of a "leaf-upstream,
   compound-in-react" component for future ports.

### Accordion

1. **Archetype of the root.** Compound upstream and compound in our layer.
2. **Primitive used.** `SparAccordion` plus `SparAccordion.Item`,
   `SparAccordion.Header`, `SparAccordion.Trigger`, `SparAccordion.Content`
   (`Accordion.tsx:66`, `:119`, `:154`, `:155`, `:219`).
3. **Public compound surface.** `Accordion.Item`, `Accordion.Header`,
   `Accordion.Title`, `Accordion.Icon`, `Accordion.Arrow`, `Accordion.Content`.
   Attached via `Object.assign(Accordion, {...})` at `Accordion.tsx:226`; no
   top-level `AccordionItem` export from the compound entry.
4. **Render-tree shape.** Single tree. The root delegates `{processedChildren}`
   into `SparAccordion` and every compound part delegates into its upstream
   counterpart or renders a React-enhancement slot.
5. **Part-by-part classification.**
   - `Accordion.Item` → Inherited (`Accordion.tsx:119`, wraps
     `SparAccordion.Item`).
   - `Accordion.Header` → Inherited (`Accordion.tsx:154-158`, wraps
     `SparAccordion.Header > SparAccordion.Trigger`, both forced to `as="div"`
     because Spar's default is `button` and we want the header row to remain a
     semantically neutral region with the trigger nested inside).
   - `Accordion.Content` → Inherited (`Accordion.tsx:219`, wraps
     `SparAccordion.Content` with `forceMount` so animation states have a stable
     tree).
   - `Accordion.Title`, `Accordion.Icon`, `Accordion.Arrow` → React-enhancement
     (`Accordion.tsx:163`, `:175`, `:187`). No upstream analogues; these exist
     to carry `data-slot`/`tk-*` for recipes.
6. **CODING_STANDARDS divergences.** None. The nested `as="div"` on Trigger is
   worth a one-line note in `AccordionBase.ts` so reviewers understand why the
   default was overridden.
7. **Proposed fix.** Classification tags in `AccordionBase.ts` and a short
   inline comment at `Accordion.tsx:154` spelling out _"Trigger rendered as
   `div` so the interactive element can nest a real button from a consumer when
   needed; default `button` would prevent composition."_ No runtime change.

### Dialog

1. **Archetype of the root.** Compound upstream and compound in our layer. The
   original audit draft flagged `Dialog.Mask` and `Dialog.CloseButton` as
   behavior-bearing bypasses; closer reading of the upstream source
   (`spar/.../Dialog/DialogContent.tsx:137-167`) walks that back — see
   classifications below.
2. **Primitive used.** `SparDialog` root (`Dialog.tsx:206`);
   `SparDialog.Content` inside `Dialog.Panel` (`Dialog.tsx:267`);
   `SparDialog.Title` inside `Dialog.Title` (`Dialog.tsx:305`);
   `SparDialog.Description` inside `Dialog.Description` (`Dialog.tsx:316`).
3. **Public compound surface.** `Dialog.Mask`, `Dialog.Panel`, `Dialog.Header`,
   `Dialog.TitleGroup`, `Dialog.Title`, `Dialog.Description`, `Dialog.SignIcon`,
   `Dialog.CloseButton`, `Dialog.Body`, `Dialog.Footer`, `Dialog.FooterActions`.
   Assembled via `Object.assign` at `Dialog.tsx:391`.
4. **Render-tree shape.** Single tree.
5. **Part-by-part classification.**
   - `Dialog.Panel` → Inherited (`Dialog.tsx:250`, wraps `SparDialog.Content`).
     This is where the dismiss behavior lives: `SparDialog.Content` calls
     `useInteractOutside` (`spar/.../DialogContent.tsx:157-167`) to fire
     `setIsOpen(false)` on pointer-down-outside and `handleKeyDown`
     (`spar/.../DialogContent.tsx:138-154`) to dismiss on Escape. It also owns
     the focus trap (`useFocusTrap`, line 135). The wrapper therefore inherits
     both dismissal paths automatically through `Dialog.Panel`.
   - `Dialog.Title` → Inherited (`Dialog.tsx:301`, wraps `SparDialog.Title` with
     `as="span"`).
   - `Dialog.Description` → Inherited (`Dialog.tsx:312`, wraps
     `SparDialog.Description` with `as="span"`).
   - `Dialog.Header`, `Dialog.TitleGroup`, `Dialog.SignIcon`, `Dialog.Body`,
     `Dialog.Footer`, `Dialog.FooterActions` → React-enhancement
     (`Dialog.tsx:274`, `:290`, `:323`, `:358`, `:369`, `:380`). No upstream
     analogues.
   - `Dialog.Mask` → **React-enhancement** (`Dialog.tsx:225`). Upstream
     `SparDialog.Overlay` exists but is _not_ on the dismissal path the wrapper
     depends on — `SparDialog.Content` already handles outside-click
     independently, so choosing to render our own backdrop does not re-implement
     Spar behavior. The wrapper's mask adds variants that upstream Overlay does
     not offer: `maskVariant` ('lightest' → 'darkest'), `isMaskBlur`,
     `hideBackdrop`, and the body-scroll-lock lifecycle (`Dialog.tsx:72-100`).
     Using `SparDialog.Overlay` would either duplicate the backdrop DOM or strip
     those visual features. Classified `react-enhancement` per
     `contract-model.md`; no code change required.
   - `Dialog.CloseButton` → **Bypass** (`Dialog.tsx:339`). `SparDialog.Close`
     exists upstream and uses `useCloseButton`
     (`spar/.../hooks/useCloseButton.ts:39-57`), but `useCloseButton`'s
     `handleClick` only calls `close()` then forwards `onClick` — it does
     **not** call `event.stopPropagation()`. Our `DialogCloseButton`
     deliberately stops propagation (`Dialog.tsx:346-348`) so the close click
     does not bubble to the `SparDialog.Content` pointer-down-outside detector
     and register twice. Delegating to `SparDialog.Close` would regress that
     guarantee. Recorded as a `technical-adaptation` bypass with an inline
     rationale in `DialogBase.ts`.
   - `DialogInteractionBoundary` (`Dialog.tsx:220`) currently `void`s
     `preventDismiss` and does nothing. **This is a real bug**: `preventDismiss`
     is a public prop on `Dialog` (surfaced in the docs API page) that has no
     runtime effect. It should be plumbed through `Dialog.Panel` →
     `SparDialog.Content` via `onPointerDownOutside` and `onEscapeKeyDown` with
     `event.preventDefault()`, and the boundary component removed. This is the
     only code-change follow-up this audit mandates; the rest is documentation.
6. **CODING_STANDARDS divergences.**
   - `DialogBase.ts` does not declare archetype classifications for the eleven
     parts (rule 1 of the new Composition Archetypes section in
     `CODING_STANDARDS.md`).
   - `Dialog.CloseButton` bypasses `SparDialog.Close` without the inline
     `exemption:` comment rule 4 requires.
   - `preventDismiss` is a public prop with no effect (dead code).
7. **Proposed fix.**
   - **PR A (preventDismiss wiring).** Split the visibility commit path in the
     root. `commitVisibility` becomes the unconditional writer; the root's
     `onOpenChange` handler (which Spar invokes for Escape + outside-click
     dismiss via `SparDialog.Content`) checks `preventDismiss` before forwarding
     to `commitVisibility`, and `requestClose` (invoked only by
     `Dialog.CloseButton`) calls `commitVisibility` directly. This keeps the
     explicit close-button path working while blocking Spar's dismissal paths.
     Remove the no-op `DialogInteractionBoundary` wrapper. Tests: Escape
     blocked, outside pointer-down blocked, and a control that confirms Escape
     still dismisses when the flag is off.
   - **PR B (archetype classification JSDoc).** Add the `@archetype` / `@bypass`
     lines to every `*Base.ts` so future ports inherit a worked example. Pure
     documentation; no runtime impact.
   - **Not proposed:** rewriting `DialogMask` to wrap `SparDialog.Overlay`
     (would regress visual features) or rewriting `DialogCloseButton` to wrap
     `SparDialog.Close` (would regress `stopPropagation`).

### Input

1. **Archetype of the root.** Compound upstream and compound in our layer.
2. **Primitive used.** `SparInput` root (`Input.tsx:127`); `SparInputField`
   inside `Input.Field` (`Input.tsx:215`); `SparInputLabel` inside `Input.Label`
   (`Input.tsx:152`); `SparInputDescription` inside `Input.Description`
   (`Input.tsx:351`); `SparInputErrorMessage` inside `Input.ErrorMessage`
   (`Input.tsx:366`).
3. **Public compound surface.** `Input.Label`, `Input.Asterisk`,
   `Input.Container`, `Input.Field`, `Input.LeadingIcon`, `Input.TrailingIcon`,
   `Input.Prefix`, `Input.Suffix`, `Input.Spinner`, `Input.ClearButton`,
   `Input.Description`, `Input.ErrorMessage`. Assembled via `Object.assign` at
   `Input.tsx:373`.
4. **Render-tree shape.** Single tree. Root renders `{children}` via
   `SparInput`; consumers compose the parts.
5. **Part-by-part classification.**
   - `Input.Field`, `Input.Label`, `Input.Description`, `Input.ErrorMessage` →
     Inherited.
   - `Input.Container`, `Input.LeadingIcon`, `Input.TrailingIcon`,
     `Input.Prefix`, `Input.Suffix`, `Input.Spinner`, `Input.ClearButton`,
     `Input.Asterisk` → React-enhancement. No upstream analogues; each exists
     because the visual anatomy of the Takeoff input has affordances (leading
     icon, clear button, prefix/suffix, etc.) that are not part of the headless
     Spar input primitive.
6. **CODING_STANDARDS divergences.** None. `Input.Spinner`, `Input.ClearButton`,
   `Input.ErrorMessage`, and `Input.Asterisk` already return `null` when their
   condition is not met, matching the conditional-subcomponent test checklist.
7. **Proposed fix.** Classification tags only. No code change.

## Summary table

| part                                                               | archetype         | upstream counterpart           | follow-up                                                                            |
| ------------------------------------------------------------------ | ----------------- | ------------------------------ | ------------------------------------------------------------------------------------ |
| `Button` (button-mode)                                             | inherited root    | `SparButton`                   | —                                                                                    |
| `Button` (link-mode)                                               | bypass root       | `SparButton as="a"`            | document `technical-adaptation` in base                                              |
| `Button.Label`                                                     | react-enhancement | —                              | —                                                                                    |
| `Button.LeadingIcon`                                               | react-enhancement | —                              | —                                                                                    |
| `Button.TrailingIcon`                                              | react-enhancement | —                              | —                                                                                    |
| `Button.Spinner`                                                   | react-enhancement | —                              | —                                                                                    |
| `Checkbox` (all parts)                                             | react-enhancement | —                              | —                                                                                    |
| `Accordion` root                                                   | inherited         | `SparAccordion`                | —                                                                                    |
| `Accordion.Item`                                                   | inherited         | `SparAccordion.Item`           | —                                                                                    |
| `Accordion.Header`                                                 | inherited         | `SparAccordion.Header/Trigger` | note the `as="div"` decision                                                         |
| `Accordion.Content`                                                | inherited         | `SparAccordion.Content`        | —                                                                                    |
| `Accordion.Title/Icon/Arrow`                                       | react-enhancement | —                              | —                                                                                    |
| `Dialog` root                                                      | inherited         | `SparDialog`                   | —                                                                                    |
| `Dialog.Panel`                                                     | inherited         | `SparDialog.Content`           | plumb `preventDismiss` through it (PR A)                                             |
| `Dialog.Title/Description`                                         | inherited         | matching `SparDialog` parts    | —                                                                                    |
| `Dialog.Mask`                                                      | react-enhancement | —                              | (Overlay upstream exists; we add mask variants visually, dismissal lives in Content) |
| `Dialog.CloseButton`                                               | **bypass**        | `SparDialog.Close`             | keep bypass; add `exemption:` comment for `stopPropagation`                          |
| `Dialog.Header/Body/Footer/...`                                    | react-enhancement | —                              | —                                                                                    |
| `Input.Field/Label/Description/ErrorMessage`                       | inherited         | matching `SparInput` parts     | —                                                                                    |
| `Input.Container/Prefix/Suffix/Icons/Spinner/ClearButton/Asterisk` | react-enhancement | —                              | —                                                                                    |

## Exit checklist

The audit's exit (see frontmatter) requires three things to land before this
file is deleted:

1. **`CODING_STANDARDS.md` § Composition Archetypes** — DONE in the same PR that
   landed this audit.
2. **`api-decision-framework.md` § 7 single-render-tree bullet** — DONE in the
   same PR that landed this audit.
3. **Code follow-ups** — scoped below.

### Code follow-ups

**PR A — preventDismiss wiring (the only real bug).**

- `packages/react-spar/src/components/dialog/Dialog.tsx`: remove the no-op
  `DialogInteractionBoundary`; thread `preventDismiss` through the context so
  `Dialog.Panel` can forward `onPointerDownOutside` / `onEscapeKeyDown` handlers
  to `SparDialog.Content` that call `event.preventDefault()` when the flag is
  set. Add two tests.

**PR B — archetype classification JSDoc (pure documentation).**

- `ButtonBase.ts` — per-part archetype lines; link-mode bypass rationale.
- `CheckboxBase.ts` — every part react-enhancement (leaf upstream).
- `AccordionBase.ts` — inherited vs react-enhancement per part; Trigger
  `as="div"` rationale.
- `DialogBase.ts` — inherited / react-enhancement per part; CloseButton bypass
  rationale (stopPropagation vs `useCloseButton`).
- `InputBase.ts` — inherited (Field / Label / Description / ErrorMessage) vs
  react-enhancement (Container / Icons / Prefix / Suffix / Spinner / ClearButton
  / Asterisk).

**Not proposed.**

- Rewriting `DialogMask` to wrap `SparDialog.Overlay`. The upstream Overlay does
  not offer `maskVariant` / `isMaskBlur` / `hideBackdrop` / body-scroll-lock;
  wrapping would either duplicate DOM or regress visuals.
- Rewriting `DialogCloseButton` to wrap `SparDialog.Close`. The upstream
  `useCloseButton` does not stop propagation; the stop is what keeps a close
  click from also registering as a pointer-down-outside on `SparDialog.Content`.

Each PR lands with its own parity-review report per the merge checklist in
`packages/react-spar/docs/CODING_STANDARDS.md`.

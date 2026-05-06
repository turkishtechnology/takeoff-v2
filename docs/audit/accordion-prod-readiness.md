# Accordion Prod Readiness Audit

## Source Files

### takeoff-ui

- `/Users/U_TURAN4/Desktop/http/takeoff-ui/packages/core/src/components/tk-accordion/tk-accordion.tsx` -
  `TkAccordion` props, active-index state, events, root DOM.
- `/Users/U_TURAN4/Desktop/http/takeoff-ui/packages/core/src/components/tk-accordion/tk-accordion-item.tsx` -
  `TkAccordionItem` props, slots, active event, item DOM.
- `/Users/U_TURAN4/Desktop/http/takeoff-ui/packages/core/src/components/tk-accordion/tk-accordion.scss` -
  `.tk-accordion` root style hook.
- `/Users/U_TURAN4/Desktop/http/takeoff-ui/packages/core/src/components/tk-accordion/tk-accordion-item.scss` -
  item class/modifier style contract.
- `/Users/U_TURAN4/Desktop/http/takeoff-ui/packages/core/src/components/tk-accordion/test/tk-accordion.spec.tsx` -
  core state/icon/slot smoke coverage.
- `/Users/U_TURAN4/Desktop/http/takeoff-ui/packages/core/src/components/tk-accordion/test/tk-accordion-item.spec.tsx` -
  item active-change coverage.
- `/Users/U_TURAN4/Desktop/http/takeoff-ui/docs/docs/Components/Accordion.mdx` -
  public docs.
- `/Users/U_TURAN4/Desktop/http/takeoff-ui/docs/src/docs-files/tk-accordion/accordionPlaygroundConfig.json` -
  docs playground props.

### spar

- `/Users/U_TURAN4/Desktop/http/spar/packages/spar/src/components/Accordion/Accordion.tsx` -
  headless root state, registry, keyboard focus context.
- `/Users/U_TURAN4/Desktop/http/spar/packages/spar/src/components/Accordion/AccordionItem.tsx` -
  item identity, `Collapsible` wiring, ids.
- `/Users/U_TURAN4/Desktop/http/spar/packages/spar/src/components/Accordion/AccordionHeader.tsx` -
  semantic heading wrapper.
- `/Users/U_TURAN4/Desktop/http/spar/packages/spar/src/components/Accordion/AccordionTrigger.tsx` -
  trigger keyboard navigation and registry.
- `/Users/U_TURAN4/Desktop/http/spar/packages/spar/src/components/Accordion/AccordionContent.tsx` -
  region wrapper.
- `/Users/U_TURAN4/Desktop/http/spar/packages/spar/src/components/Accordion/types.ts` -
  headless Accordion prop types.
- `/Users/U_TURAN4/Desktop/http/spar/packages/spar/src/components/Accordion/hooks/useAccordionContext.ts` -
  root context guard.
- `/Users/U_TURAN4/Desktop/http/spar/packages/spar/src/components/Accordion/hooks/useAccordionItemContext.ts` -
  item context guard.
- `/Users/U_TURAN4/Desktop/http/spar/packages/spar/src/components/Collapsible/*` -
  controlled open state, trigger/content ARIA, `forceMount`, SSR-relevant hidden
  handling.
- `/Users/U_TURAN4/Desktop/http/spar/packages/spar/src/components/Accordion/__tests__/Accordion.takeoff.test.tsx` -
  Takeoff vocabulary and normalization coverage.
- `/Users/U_TURAN4/Desktop/http/spar/packages/spar/src/components/Accordion/__tests__/Accordion.test.tsx` -
  legacy headless behavior coverage.
- `/Users/U_TURAN4/Desktop/http/spar/packages/spar/src/components/Accordion/__tests__/Accordion.integration.test.tsx` -
  nested/dynamic workflow coverage.
- `/Users/U_TURAN4/Desktop/http/spar/packages/spar/src/components/Accordion/__tests__/Accordion.a11y.test.tsx` -
  a11y and keyboard coverage.

### takeoff-spar

- `/Users/U_TURAN4/Desktop/http/takeoff-spar/packages/react-spar/src/components/accordion/Accordion.tsx` -
  React root wrapper and visual context provider.
- `/Users/U_TURAN4/Desktop/http/takeoff-spar/packages/react-spar/src/components/accordion/AccordionItem.tsx` -
  item wrapper and `data-open` hook.
- `/Users/U_TURAN4/Desktop/http/takeoff-spar/packages/react-spar/src/components/accordion/AccordionHeader.tsx` -
  heading wrapper.
- `/Users/U_TURAN4/Desktop/http/takeoff-spar/packages/react-spar/src/components/accordion/AccordionTrigger.tsx` -
  trigger wrapper, title span, internal arrow.
- `/Users/U_TURAN4/Desktop/http/takeoff-spar/packages/react-spar/src/components/accordion/AccordionContent.tsx` -
  content wrapper and `data-open` hook.
- `/Users/U_TURAN4/Desktop/http/takeoff-spar/packages/react-spar/src/components/accordion/base.ts` -
  canonical `tk-*` classes and `data-slot` setup.
- `/Users/U_TURAN4/Desktop/http/takeoff-spar/packages/react-spar/src/components/accordion/context.ts` -
  visual variant context.
- `/Users/U_TURAN4/Desktop/http/takeoff-spar/packages/react-spar/src/components/accordion/defaults.ts` -
  default visual prop values.
- `/Users/U_TURAN4/Desktop/http/takeoff-spar/packages/react-spar/src/components/accordion/types.ts` -
  public React API types.
- `/Users/U_TURAN4/Desktop/http/takeoff-spar/packages/react-spar/src/components/accordion/index.ts` -
  public component/type exports.
- `/Users/U_TURAN4/Desktop/http/takeoff-spar/packages/react-spar/src/components/accordion/Accordion.test.tsx` -
  wrapper state, DOM, arrow, customization tests.
- `/Users/U_TURAN4/Desktop/http/takeoff-spar/packages/react-spar/src/components/accordion/types.test-d.ts` -
  public type contract tests.
- `/Users/U_TURAN4/Desktop/http/takeoff-spar/apps/docs/docs/components/accordion.mdx` -
  docs demos.
- `/Users/U_TURAN4/Desktop/http/takeoff-spar/apps/docs/docs/components/accordion.api.config.mjs` -
  generated API docs config.

### takeoff-design

- `/Users/U_TURAN4/Desktop/http/takeoff-design/packages/tokens/styles/recipes/_accordion.scss` -
  React/light-DOM accordion recipe.
- `/Users/U_TURAN4/Desktop/http/takeoff-design/packages/tokens/styles/_index.scss` -
  recipe application to `.tk-accordion` and `.tk-accordion-item`.
- `/Users/U_TURAN4/Desktop/http/takeoff-design/packages/tokens/tokens/component/accordion.json` -
  accordion radius, padding, gap tokens.

## Current Public API

- Core `tk-accordion`: `activeIndex`, `allowMultiple`, `arrowPosition`,
  `expandIcon`, `collapseIcon`, `hideArrows`, `type`, `mode`; events
  `tk-active-index-change` and deprecated `tk-accordion-item-selected`.
- Core `tk-accordion-item`: `active`, `itemKey`, `header`, `size`, `icon`; slots
  `header` and `content`; internal event `tk-active-change`.
- Spar `Accordion`: `allowMultiple`, `activeIndex`, `defaultActiveIndex`,
  `onActiveIndexChange`, `preventCollapse`, `disabled`, `orientation`;
  deprecated aliases `type`, `value`, `defaultValue`, `onValueChange`,
  `isCollapsible`.
- takeoff-spar `Accordion`: Takeoff visual props `type`, `mode`, `size`,
  `arrowPosition`, `hideArrows`, `expandIcon`, `collapseIcon`; Spar behavior
  props `allowMultiple`, `activeIndex`, `defaultActiveIndex`,
  `onActiveIndexChange`, `preventCollapse`, `disabled`, `orientation`; compound
  parts `Accordion.Item`, `Accordion.Header`, `Accordion.Trigger`,
  `Accordion.Content`.
- takeoff-spar intentionally requires `Accordion.Item itemKey`; it does not
  expose Core item-level `active`, `header`, or Web Component event names.

## Current DOM Contract

- Core shadow DOM uses `.tk-accordion`; item shadow DOM uses
  `.tk-accordion-item` plus modifier classes `grouped`, `divided`, `base`,
  `large`, `compact`, `open`, and internal `.header`, `.title`, `.content`.
- takeoff-design light-DOM recipe expects `.tk-accordion`, `.tk-accordion-item`,
  `.tk-accordion-item-header`, `.tk-accordion-item-title`,
  `.tk-accordion-item-arrow`, `.tk-accordion-item-content`.
- takeoff-design state/variant selectors are item/content `data-open`, item
  `data-type`, item `data-mode`, item `data-size`; root recipe only needs
  `.tk-accordion`.
- takeoff-spar emits the canonical `tk-*` classes, `data-open` on open
  item/content, item `data-type/mode/size`, root
  `data-mode/size/arrow-position`, and Spar root `data-orientation`.
- Source-backed decision: root `data-type` remains Spar's headless
  `single/multiple` hook; Takeoff visual `grouped/divided` is reflected on
  `Accordion.Item` because the takeoff-design recipe reads item `data-type`.
- takeoff-spar item now also emits Core-compatible modifier classes (`grouped`,
  `divided`, `base`, `large`, `compact`, `open`) in addition to the data
  attributes.

## Current A11y Contract

- Spar owns trigger button semantics, `aria-expanded`, `aria-controls`, content
  ids, `role="region"`, `aria-labelledby`, disabled trigger state, and keyboard
  navigation.
- Spar uses `useId` for generated ids, so generated trigger/content ids are
  hydration-safe.
- takeoff-spar keeps `Accordion.Arrow` internal and marks arrow wrappers
  `aria-hidden="true"`.
- Spar `AccordionHeader` accepts any numeric `level`; takeoff-spar guards its
  public wrapper so invalid levels fall back to `h3` before reaching the
  primitive.

## Current Test Coverage

- Spar covers Takeoff vocabulary normalization, controlled/uncontrolled state,
  numeric/string keys, missing key diagnostics, keyboard navigation,
  nested/dynamic workflows, and a11y smoke.
- takeoff-spar covers type/mode defaults, legacy `type="compact"`, state basics,
  controlled single/multiple mode, numeric payloads, multiple payloads, internal
  arrows, compound classes, heading level fallback, `data-open`,
  `data-disabled`, force-mounted closed content, dynamic children removal,
  nested state independence, and theme/slot customization.

## Current Story/Docs Coverage

- takeoff-spar docs currently include playground, multiple panels, controlled,
  and custom arrows demos.
- API docs are generated from
  `apps/docs/docs/components/accordion.api.config.mjs`.
- Story/docs expansion is intentionally deferred to FAZ 11-18 per this session
  scope.

## Gaps

- P0 addressed: `AccordionActiveIndexChangeHandler` export. Affected file:
  `packages/react-spar/src/components/accordion/types.ts`; action: added named
  type and used it in `AccordionProps`.
- P0 addressed: root disabled state reflection. Affected file:
  `packages/react-spar/src/components/accordion/Accordion.tsx`; action: mirrors
  `disabled` with `data-disabled` while forwarding it to Spar.
- P0 addressed: Core modifier classes on React item DOM. Affected file:
  `packages/react-spar/src/components/accordion/AccordionItem.tsx`; action:
  appends `type`, `mode`, `size`, and `open` classes alongside data attributes.
- P0 addressed: invalid header level fallback. Affected file:
  `packages/react-spar/src/components/accordion/AccordionHeader.tsx`; action:
  normalizes to 1-6 with default 3.
- P0 addressed: wrapper tests for state normalization and DOM/data hooks.
  Affected file:
  `packages/react-spar/src/components/accordion/Accordion.test.tsx`; action:
  added behavior-focused regression tests.
- P1: style contract should be split into a dedicated audit. Affected file:
  `docs/audit/accordion-style-contract.md`; action deferred to FAZ 11.
- P1: migration docs and visual regression stories are not complete. Affected
  files: docs/stories; action deferred to FAZ 12-14.

## Proposed Implementation Plan

- FAZ 1: create source-backed API compatibility matrix with
  prop/event/slot/class/data mapping.
- FAZ 2: add/export `AccordionActiveIndexChangeHandler`; keep `itemKey` required
  and reject Web Component shortcuts in type tests.
- FAZ 3: keep state ownership in Spar; add takeoff-spar tests for
  controlled/uncontrolled normalization, default initial-only behavior, disabled
  item, dynamic children, and nested state isolation.
- FAZ 4: keep public compound surface to `Item`, `Header`, `Trigger`, `Content`;
  keep arrow internal; add safe heading-level fallback in wrapper and tests.
- FAZ 5: update wrapper DOM attributes/classes for item visual `data-type`, root
  `data-disabled`, item modifier classes, `data-open`, and forceMount behavior;
  test canonical class/data hooks.

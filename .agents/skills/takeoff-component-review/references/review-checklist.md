# Review checklist

## Evidence checklist

- [ ] Recipe available
- [ ] Decisions available or not needed
- [ ] Diff/patch/working tree available
- [ ] Final report available
- [ ] Validation logs available
- [ ] Docs/API generation evidence available
- [ ] Type-test evidence available

## Scope checklist

- [ ] Touched files limited to component scope
- [ ] No `takeoff-ui` changes
- [ ] No generic infra
- [ ] No workflows
- [ ] No audit/migration scaffolding
- [ ] No unrelated components
- [ ] spar changes justified and minimal, if present
- [ ] takeoff-design changes selector-only, if present

## Architecture checklist

- [ ] Wrapper does not duplicate spar state
- [ ] Wrapper does not implement keyboard navigation
- [ ] Wrapper does not implement focus management
- [ ] Wrapper does not override spar SSR id behavior
- [ ] A11y handled by spar except decorative `aria-hidden` and narrow wrapper
      guards
- [ ] Visual aliases/normalization remain in wrapper

## API checklist

- [ ] Prop names align with core
- [ ] Defaults align with core or recipe decisions
- [ ] Events map correctly
- [ ] Value types exported
- [ ] Handler types exported
- [ ] All public part props exported
- [ ] Native prop collisions omitted
- [ ] Refs typed
- [ ] Deprecated aliases handled intentionally
- [ ] Internal-only parts not exported

## Compound checklist

- [ ] Root compound export exists
- [ ] Public part display names exist
- [ ] Object.assign pattern or local equivalent used
- [ ] Docs demonstrate compound API
- [ ] Tests cover display names/parts where applicable

## DOM checklist

- [ ] Root canonical class preserved
- [ ] Part canonical classes preserved
- [ ] Consumer className composed
- [ ] Required data attrs emitted
- [ ] Data attrs at correct levels
- [ ] No invented contract attrs
- [ ] `forceMount` behavior tested when applicable
- [ ] Decorative spans/icons have `aria-hidden`

## Passthrough checklist

- [ ] `className`
- [ ] `style`
- [ ] `id`
- [ ] `data-*`
- [ ] `aria-*`
- [ ] refs
- [ ] user event handlers compose
- [ ] `slotProps` / `classNames` follow existing pattern if present

## Tests/docs/exports checklist

- [ ] API normalization tests
- [ ] DOM contract tests
- [ ] displayName tests
- [ ] visual prop tests
- [ ] className/slotProps/classNames tests
- [ ] `types.test-d.ts`
- [ ] docs default demo
- [ ] docs major variants
- [ ] docs controlled demo
- [ ] docs customization/edge demo
- [ ] API config/generation
- [ ] component index exports
- [ ] package component export

## Validation checklist

- [ ] `pnpm install`
- [ ] `pnpm exec vitest run {{component}}`
- [ ] `pnpm exec vitest run`
- [ ] `pnpm exec tsc --noEmit`
- [ ] `pnpm exec eslint .`
- [ ] `pnpm build`
- [ ] failures triaged as related or pre-existing with evidence

## Decision checklist

- [ ] Approved decisions followed
- [ ] Rejected options not implemented
- [ ] Deferred decisions remain explicit
- [ ] New uncertainty surfaced as `Decision Needed`

## Skeptical self-check checklist

- [ ] Local evidence refreshed from all four repos or equivalent excerpts
      supplied
- [ ] Scope red-team pass completed
- [ ] Source-of-truth pass completed against current local core/design/primitive
      files
- [ ] Responsibility inversion pass completed
- [ ] Selector proof pass completed
- [ ] Decision drift pass completed
- [ ] Evidence credibility pass completed
- [ ] Counterexample pass completed and recorded

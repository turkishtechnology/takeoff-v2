# RFC: Input API Redesign — Two-Tier (props-first + escape-hatch parts)

**Status:** Draft / for discussion
**Scope:** `@takeoff-ui/react-spar` `Input` component family
**Supersedes (in part):** the "Compound component rule", "Input number stepper
contract", and "Input chips contract" sections of
[`component-authoring-contract.md`](./component-authoring-contract.md) — see
[§8 Contract changes](#8-contract-changes-require-sign-off).

> This is a design proposal, not an implemented change. Nothing here ships
> without sign-off, because it revises decisions the authoring contract already
> ratified.

---

## 1. Summary

`Input` today is a single compound component with **13 public parts**, 12 of
which are takeoff-invented (`@archetype react-enhancement`, no Spar equivalent).
Only `Input.Field` is inherited from Spar.

This RFC proposes a **two-tier API**:

- **Tier 1 — props-first convenience.** Common variants become a prop
  (`clearable`, `loading`) or a dedicated **sibling component** under the
  `Input.` namespace (`Input.Password`, `Input.Number`, `Input.Chips`,
  `Input.Textarea`). One line, zero assembly, discoverable via autocomplete.
- **Tier 2 — escape-hatch parts.** Every existing part stays public so advanced
  consumers keep full control. The props/sibling components render those parts
  internally — exactly like `Input.Chips` already renders the shared `Chip`.

Net effect: the **flexibility ceiling is unchanged** (parts remain), the **floor
cost drops** (common cases become one line), and several fragile, undocumented
rules (counter-by-DOM-placement, Strength-by-position) become explicit.

---

## 2. Problem

### 2.1 The boilerplate cliff (measured)

Counting `Input.*` parts per documented scenario:

| Scenario | Parts to assemble | Notes |
| --- | --- | --- |
| Plain field / sizes / textarea | **1** (`Input.Field`) | trivial |
| Adornments (icon/prefix) | **3** | Prefix/Suffix/Leading/Trailing |
| Clearable | **2** | `Field` + `ClearButton` |
| Password (full) | **4** | LeadingIcon + Field + RevealButton + Strength + a hand-written `LockIcon` SVG |
| Number | **4** | Field + Stepper > Decrement + Increment (nesting matters) |
| Counter | **3** | Decrement + Field + Increment (flat — different from Number) |
| Chips | **2** | `Chips` + `Field` |

The minimal field is one part, but **every "smart" variant requires knowing
which specific parts to compose** — and for number/counter, the exact nesting
that selects the look. That is a steep cliff for a *styled* component.

### 2.2 Load-bearing arrangement (fragile, implicit)

Several behaviors depend on DOM ordering/nesting that the API never states:

- **Counter vs Number** are the *same* parts; the counter look is selected only
  when `Decrement`/`Increment` are **direct children flanking the field**
  (outside `Input.Stepper`). The SCSS detects this structurally —
  `_input.scss` (≈ L357–372):

  ```scss
  & > .tk-input-decrement.tk-button[data-type='text'],
  & > .tk-input-increment.tk-button[data-type='text'] { color: var(--primary-base); … }

  &:has(> .tk-input-decrement):has(> .tk-input-increment) .tk-input-field {
    text-align: center;
  }
  ```

  Wrap the buttons in a `<div>`, or render only one of them, and the counter
  silently breaks. **No `mode`/`data-*` flag exists** — the comment says so on
  purpose. Ordering *is* the API.

- **`Input.Strength`** is authored *inside* `Input` (it reads the field value
  from context) but renders *below* the bordered row — its DOM position doesn't
  match its visual position.

### 2.3 Wrong altitude for a styled wrapper

takeoff-v2 sits on **headless Spar**. Radix/Ark-tier part granularity is correct
for the *headless* layer; at the *styled-convenience* layer it just becomes
boilerplate every consumer re-assembles. Industry practice (MUI, Mantine, Ant,
Chakra, react-aria) is consistent:

- **Clear / loading / reveal** are **props or a dedicated component**, never
  hand-assembled parts.
- **Nobody** ships "stepper" and "counter" as two separate APIs — it's one
  number component; layout is styling.
- **Nobody** bundles a **strength meter** into the Input — not even Mantine's
  `PasswordInput`. Strength is app-domain logic.
- **Chips/tags** is universally a **separate component** (`TagsInput`,
  `Select mode="tags"`, `TagGroup`).

### 2.4 This contradicts the *current* contract — on purpose

The authoring contract deliberately made the opposite call, and it had real
reasons. Stated fairly:

- **"Keep the wrapper thin."** Spar's Input is a *scalar headless primitive with
  no `mode`*; the contract chose composition so takeoff-spar stays thin and the
  anatomy stays explicit (contract §"Input modes as composition", ~L56–66).
- **Explicit anatomy is treated as a feature**, not a cost: predictable DOM,
  no magic, every node themeable via `slotProps`/`classNames`.
- The parts are public for *stated* reasons: `Input.ClearButton` /
  `Input.RevealButton` because "they are focusable controls with their own
  accessibility semantics" (L213); `Input.Spinner` / `Input.Strength` because
  "the design requires consumers to place these optional parts explicitly"
  (L216). These are **two different justifications**, not one.
- Counter "is not a separate part set … no `mode`/`data-counter` flag is
  introduced" (L221–225).
- "'Some consumer might want to customize it' is **not** a justification" for
  promoting a decorative part, and changing a part "is a contract change and
  must be approved" (L241–244).

**Why the redesign still holds despite all that:**

- The a11y-semantics reason for the *buttons* fully survives — they remain
  public parts (the escape hatch). We're changing the **default path**, not
  deleting the control.
- "Thin wrapper" cuts both ways. Twelve invented parts is not thin; it's a lot
  of takeoff-owned surface. A `clearable` prop that internally renders one of
  those parts is the same amount of wrapper code, fewer public concepts.
- Crucially, `clearable` and `loading` are **already Takeoff Core canonical
  vocabulary** that the contract deliberately *dropped* in favor of composition
  (contract L39, L56–66). Tier 1 **restores Core product names** rather than
  inventing new ones — this is a point *for* the redesign, on the contract's own
  terms.

So this RFC **is** that contract-change request. §8 lists the exact edits, and
§6 names the live counter-arguments we still have to weigh.

---

## 3. Proposed API

### 3.1 The two tiers

```
Input (namespace)
│
├── TIER 2 — root + compound PARTS  (escape-hatch; live INSIDE <Input>)
│   ├── <Input>                root: border, state, context, props
│   ├── Input.Field            core element (as="input" | "textarea")
│   ├── Input.StartSection     left content  (merges Prefix + LeadingIcon)
│   ├── Input.EndSection       right content container
│   ├── Input.ClearButton      ← default path: `clearable` prop
│   ├── Input.RevealButton     ← embedded by Input.Password
│   ├── Input.Spinner          ← default path: `loading` prop; renders shared <Spinner/>
│   ├── Input.Increment/Decrement/Stepper  ← owned by Input.Number
│   └── Input.Strength         ← embedded by Input.Password `withStrength`
│
└── TIER 1 — sibling COMPONENTS  (render their OWN root; grouped under Input.)
    ├── Input.Textarea   { rows, autosize, minRows, maxRows }
    ├── Input.Number     { layout: 'stepper' | 'counter', hideControls, min/max/step }
    ├── Input.Password   { withStrength, leftSection }      ← reveal embedded
    ├── Input.Chips      { value, onValueChange, separator, max, allowDuplicates }
    ├── Input.Currency   { … }   ← NEW — engine decided in a follow-up mini-RFC
    └── Input.Phone      { … }   ← NEW — engine decided in a follow-up mini-RFC

Input root props (Tier 1 conveniences):
    clearable?:  boolean | { icon?, label?, onClear? }
    loading?:    boolean
    leftSection?, rightSection?: ReactNode      ← escape-hatch slots
    size, invalid, disabled, readOnly, required (unchanged)
```

**Naming decision (ratified with the requester):** sibling components live under
the `Input.` namespace (`Input.Number`, not a separate `NumberInput`) — matching
Ant Design's `Input.Password`/`Input.Search` and the team's existing convention.
They are *siblings* (render their own root), not parts placed inside `<Input>`.

`Input.Field` **keeps its name** (not `Input.Text`): with `as="textarea"` the
same part renders a textarea, so "Field" is the correct neutral name. It stays a
**part**, not a sibling — the core element can't be a root; it shares the
bordered row with the other parts.

### 3.2 Before / after (each scenario)

```tsx
// Icon field
- <Input><Input.LeadingIcon><SearchIcon/></Input.LeadingIcon><Input.Field/></Input>
+ <Input leftSection={<SearchIcon/>} />

// Clearable
- <Input><Input.Field defaultValue="TK1928"/><Input.ClearButton/></Input>
+ <Input clearable defaultValue="TK1928" />

// Loading
- <Input><Input.Field/>{loading && <Input.Spinner/>}</Input>
+ <Input loading={loading} />

// Password (+ optional strength)
- <Input><Input.LeadingIcon><LockIcon/></Input.LeadingIcon>
-   <Input.Field type="password"/><Input.RevealButton/><Input.Strength/></Input>
+ <Input.Password withStrength leftSection={<LockIcon/>} />

// Number / counter (one component, layout is a prop)
- <Input><Input.Field type="number"/><Input.Stepper><Input.Decrement/><Input.Increment/></Input.Stepper></Input>
- <Input><Input.Decrement/><Input.Field type="number"/><Input.Increment/></Input>  // counter, by placement
+ <Input.Number />                      // default stepper layout
+ <Input.Number layout="counter" />     // value centered, flanking +/−

// Textarea
- <Input><Input.Field as="textarea" rows={4}/></Input>
+ <Input.Textarea rows={4} autosize />

// Chips
- <Input><Input.Chips value={tags} onValueChange={setTags}/><Input.Field/></Input>
+ <Input.Chips value={tags} onValueChange={setTags} separator="," />
```

### 3.3 The core principle — "prop is the default path, part is the escape hatch"

Nothing is deleted. Three customization layers, like Ant's `allowClear`:

```tsx
<Input clearable />                                         // 1. default
<Input clearable={{ icon: <MyX/>, label: 'Sil', onClear }} />  // 2. customized prop
<Input><Input.Field/><Input.EndSection>                    // 3. full control
  <Input.ClearButton><MyClear/></Input.ClearButton>
</Input.EndSection></Input>
```

This is precisely what we already did for chips: `Input.Chips` renders the shared
`Chip` internally, but `Chip` stays public and customizable. The same move,
applied to clear/reveal/spinner/stepper.

---

## 4. Decisions captured in this RFC

| Topic | Decision |
| --- | --- |
| Sibling naming | `Input.Number` / `Input.Password` / `Input.Chips` / `Input.Textarea` / `Input.Currency` / `Input.Phone` — namespaced, not standalone names. |
| `Input.Field` | Stays a **part**, keeps the name. |
| Textarea | New **sibling** `Input.Textarea` (multiline-only props like `autosize`); `Input.Field as="textarea"` remains the escape-hatch. |
| Number vs Counter | One sibling `Input.Number`; `layout: 'stepper' \| 'counter'` prop replaces DOM-placement detection. |
| Strength | Stays available, but **embedded** via `Input.Password withStrength` rather than a part the consumer places. (Industry: strength is app-domain — consider a standalone `PasswordStrength` if rules must be injectable.) |
| Spinner | A real `Spinner` component will live **in react-spar** (like `Chip`). `Input.Spinner` keeps its **positioning** role but renders the shared `<Spinner/>`; the `tk-input-default-spinner` CSS animation is removed. Default path: `loading` prop. |
| Currency / Phone | New siblings, but the **formatting/masking engine is deferred to a separate mini-RFC** (Phone may need a country selector; Currency needs grouping/symbol/locale). They touch the "masking is consumer-owned" policy and the "upstream-first / no-adapter-hook" rules — decide deliberately, not here. |
| Clearable + chips | The clear behavior built in this branch (clear wipes text + all chips, stays visible while content exists) becomes the `clearable` prop's behavior. |

---

## 5. Migration & blast radius

**Good news: there are no external consumers yet.** Real usage is
**documentation-only** (`input.mdx`, `label.mdx`, `forms/*.mdx`,
`ComponentGrid.tsx`); the only test is `Label.test.tsx` rendering `<Input.Field/>`.
No consumer source imports the per-part `Input*Props`/`Slot` types. So the blast
radius is: **docs + examples + the changeset**, not a downstream app fleet.

Because parts are retained as escape-hatches, the migration is **additive-first**:

| Step | Change | Effort / Breaking? |
| --- | --- | --- |
| 1 | Add `clearable`, `loading`, `leftSection`/`rightSection` props (render existing parts internally) | Small, additive. The root already owns all clear state in context, so `clearable` just conditionally renders `Input.ClearButton`. |
| 2 | Add siblings `Input.Textarea`, `Input.Number`, `Input.Password` (wrap existing parts) | Medium, additive. Each renders its own `<Input>` root + the relevant parts. |
| 3 | Add `Input.Number` `layout` prop emitting a `data-layout` attribute; keep DOM-placement detection working in parallel | Medium. **Includes an SCSS change** (new attribute selectors alongside the existing `& > …` / `:has(> …)` ones). |
| 4 | Migrate docs/examples to the props-first form | Small, docs only. |
| 5 | Merge `Prefix`+`LeadingIcon` → `StartSection`, `Suffix`+`TrailingIcon` → `EndSection` | **Breaking + SCSS rewrite, not a plain rename.** Prefix (divider + text) and LeadingIcon (icon-centered) have different styles; one section slot must handle both. Do at a 0.x minor with a changeset. |
| 6 | Remove DOM-placement counter detection once `layout` is the only path | **Breaking + SCSS rewrite.** Delete the `& > .tk-input-decrement` / `:has(> …)` recipe and re-validate the counter visual against `data-layout`. Only after step 3 bakes. |
| 7 | Move chips fully to the `Input.Chips` sibling shape (already mostly there) | Minor. |

Steps 1–2, 4 ship value with zero breakage. Steps 3, 5, 6 each carry **SCSS
work**, and 5–6 are the only true API breaks — cheap now (docs-only), expensive
later (once apps adopt) — **a reason to decide soon.**

---

## 6. Counter-arguments to weigh

A fair decision needs the case *against* this RFC on the table:

- **Two ways to do everything.** Every capability gains a prop path *and* a parts
  path that must stay behaviorally identical, be documented twice, and be tested
  twice. That is a real, ongoing maintenance tax the "flexibility ceiling
  unchanged" framing hides.
- **`slotProps`/`classNames`/theme already cover customization.** The contract's
  position is that per-node customization is what `slotProps`/`classNames`/theme
  are for (L241–242), and a working `slotProps` demo already ships
  (`input.mdx`). The "customized prop" middle tier (§3.3 layer 2) partly
  duplicates this — we should decide which is the blessed path, not ship both
  blindly.
- **The headless-purist view is legitimate.** Explicit fine-grained anatomy *is*
  a feature for a design-system foundation: no magic, predictable DOM, every node
  addressable. The redesign trades some of that for convenience. That's the right
  trade at the *styled* tier — but it is a trade, not a free win.
- **Net-new scope.** Strength relocation plus two brand-new components (Currency,
  Phone) with an undecided engine inflate the blast radius beyond the
  "additive, docs-only" framing of §5. These should likely be separate RFCs.

## 7. Open questions

1. **StartSection/EndSection merge** — collapsing Prefix/Suffix/LeadingIcon/
   TrailingIcon into two sections is **not just a rename**: Prefix has a divider
   `::after` + text styling while LeadingIcon is icon-centered (`_input.scss`),
   so one slot must render text vs. icon differently. Worth the SCSS rework, or
   keep distinct parts behind `leftSection`/`rightSection` props?
2. **Strength** — embed in `Input.Password` only, or also ship a standalone
   `PasswordStrength` with injectable rules?
3. **Currency/Phone engine** — `Intl`-based in-component, or thin + consumer
   formatter? Note the contract's "upstream-first / no-adapter-hook" rules push
   heavy formatting toward Spar/native or a pure helper, not a wrapper hook.
   (Defer to a mini-RFC; flagged so we don't accidentally lock it.)
4. **Spinner dependency** — confirm the new `Spinner` lands in react-spar before
   we wire `loading`/`Input.Spinner` to it.

---

## 8. Contract changes (require sign-off)

Adopting this RFC edits [`component-authoring-contract.md`](./component-authoring-contract.md):

- **"Public by default" list** — `ClearButton`, `RevealButton`, `Spinner`,
  `Strength`, `Stepper`, `Decrement`, `Increment` move from "consumer places them
  explicitly" to "default path is a prop / sibling; the part is the escape
  hatch." Update the justification text (lines ~213–225).
- **"Some consumer might want to customize it is not a justification"** — refine:
  it's still not a reason to *promote a decorative ornament*, but exposing a
  prop-with-escape-hatch for a *control* is now the preferred default.
- **Counter** — replace "no `mode`/`data-counter` flag is introduced" with an
  explicit `Input.Number layout` prop; retire the DOM-placement recipe.
- **Number stepper contract / Chips contract** — re-home under the `Input.Number`
  / `Input.Chips` sibling components; behavior owners (native input / `string[]`
  state) are unchanged.
- **Stale reference to fix regardless** — the Chips contract (L227–229, L269)
  still describes a public `Input.Chip` part. That part no longer exists: it was
  removed in favor of the shared `Chip` component, which `Input.Chips` renders
  internally. Update the contract to match the shipped code.

---

## 9. Recommendation

Adopt Tier 1 **additively now** (steps 1–4): immediate DX win, zero breakage,
and it validates the shape against real docs. Schedule the breaking renames
(steps 5–6) while the blast radius is still docs-only. Spin Currency/Phone into
their own mini-RFC before writing any masking code.

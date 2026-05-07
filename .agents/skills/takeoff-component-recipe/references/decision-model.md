# Decision model

Use decisions for anything that affects public API, file ownership, DOM
contract, or implementation strategy and cannot be proven from the source repos.

## Decision fields

Each decision must include:

- `id`: stable ID, for example `D001`.
- `title`: short name.
- `status`: `needed`, `proposed`, `approved`, `rejected`, or `deferred`.
- `blocking`: `yes` or `no`.
- `question`: the exact unresolved question.
- `evidence`: source facts and file paths.
- `impact`: what breaks or changes if the decision is wrong.
- `options`: at least two options when alternatives exist.
- `recommendation`: one preferred option with reason, or `None` if there is no
  safe preference.
- `decision`: final user/team decision; blank until approved.
- `follow_up`: files or recipe sections that must change after approval.

## When to create a decision

Create `Decision Needed` when:

- `takeoff-ui core` and `spar` use incompatible value vocabulary.
- A slot could be a public compound part or an internal visual prop.
- A `takeoff-design` selector requires a DOM/data-state shape that spar does not
  emit.
- A primitive behavior gap might require changing `spar`.
- A wrapper fix would duplicate state, keyboard behavior, focus behavior, or SSR
  id logic.
- Defaults are missing or contradictory.
- Docs need to show a scenario but the component cannot support it.
- Validation cannot run because of environment issues that affect confidence.

## How to write decisions

Be precise and action-oriented:

```markdown
### D001 — Public exposure of Indicator

- Status: needed
- Blocking: yes
- Question: Should `Indicator` be public, or should it be controlled through
  `showIndicator` / `indicator` visual props?
- Evidence: `takeoff-ui core` has a named visual slot; `spar` exports an
  internal indicator part; `takeoff-design` styles `.tk-foo-indicator` inside
  item.
- Impact: Public part increases API surface; visual prop preserves wrapper
  ownership but limits customization.
- Options:
  1. Public `Foo.Indicator` part.
  2. Internal indicator with visual props.
- Recommendation: Option 2, because indicator is visual-only and the wrapper
  policy keeps internal-only parts private.
- Decision: _pending_
- Follow-up: Update compound structure and docs customization example.
```

## HTML decision export

The HTML template renders all decisions with editable text areas. The exported
Markdown should be treated as the human-approved decision layer and attached to
the implementation handoff.

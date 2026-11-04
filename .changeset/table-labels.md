---
'@takeoff-ui/react-spar': minor
---

`Table` strings can now be translated or reworded through a new `labels` prop.
It covers every string Table renders: the empty state, the loading spinner, the
column filter trigger and Clear button, pagination text and buttons, and the
selection and expansion controls. Pass only the keys you need (e.g.
`labels={{ filterClear: 'Temizle', pageStatus: 'Sayfa {page} / {pageCount}' }}`);
the rest keep their English defaults. Dynamic entries are `{placeholder}`
templates. Set it app-wide through `TakeoffSparProvider`
`components.Table.defaultProps.labels`; an instance `labels` is merged over it
key by key. `filterButton` and the new `filterValue` take a `{column}`
placeholder. `filterValue` names the preset filter fields, which had no
accessible name: the text input (a `filter.placeholder` stays a visible hint),
the radio and checkbox groups, and the select trigger, whose name also carries
its visible value. The page-jump submit has its own `goToPageSubmit` key.

**Behaviour changes** (accessible names and fallbacks; review any tests or
overrides that match on them):

- Filter triggers are named per column: `'Filter column'` → `'Filter {column}'`
  (e.g. `'Filter Name'`), and the new filter-field name defaults to
  `'Filter {column} value'`.
- The page-jump submit button is named `'Go'` instead of `'Go to page'`, so it
  no longer shares the input's name.
- The filter trigger, pagination region and expand button take their accessible
  names only from `labels`: an `aria-label` passed through
  `slotProps.filterButton` / `pagination` / `expandButton` is now ignored.
- An empty `filter.placeholder` on a `select` filter falls back to the default
  text (`labels.filterSelectPlaceholder`) instead of rendering an empty trigger.

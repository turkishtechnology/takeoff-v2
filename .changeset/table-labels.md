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
key by key.

An empty `filter.placeholder` on a `select` filter now falls back to the default
text (`labels.filterSelectPlaceholder`) instead of rendering an empty trigger.

---
'@takeoff-ui/react-spar': minor
---

`Table` can now be fully localized through a new `labels` prop. It covers every
string Table renders: the empty state, the loading spinner, the column filter
trigger and Clear button, pagination text and buttons, and the selection and
expansion controls. Pass only the keys you need (e.g.
`labels={{ filterClear: 'Temizle', pageStatus: 'Sayfa {page} / {pageCount}' }}`);
the rest keep their English defaults. Dynamic entries are `{placeholder}`
templates. Set it app-wide through `TakeoffSparProvider`
`components.Table.defaultProps.labels`.

A column's `filter.clearLabel` overrides the Clear text for that column, and the
Clear button is a new `filterClear` slot for `classNames` / `slotProps`.

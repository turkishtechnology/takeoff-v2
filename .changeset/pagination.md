---
'@turkish-technology/spar': minor
'@takeoff-ui/react-spar': minor
'@takeoff-design/tokens': minor
---

Add `Pagination` — page navigation for lists and search results (Core
`tk-pagination`): page and item reports, a page range with ellipses,
first/previous/next/last buttons, a page-size select and a page-jump input, in
`outlined`, `text` and `grouped` types, a `compact` mode and a `rounded` shape.

```tsx
<Pagination totalItems={240} page={page} onPageChange={setPage} />
```

Without children the root renders the full anatomy; compose `Pagination.Info` /
`Controls` / `Actions` and their parts to change it. Every string is localizable
through `labels`.

Spar gains a headless `Pagination` primitive (`Pagination.Item`, `.First`,
`.Previous`, `.Next`, `.Last`, `.Ellipsis`, `usePaginationContext` and the pure
`getPaginationItems`) that owns the page state, the page range and the
edge-disabled buttons, exported from `@turkish-technology/spar/pagination`.
`Table`'s built-in pagination now renders through it; its API and output are
unchanged. The tokens package ships the `.tk-pagination` recipe.

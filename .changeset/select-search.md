---
'@turkish-technology/spar': minor
'@takeoff-ui/react-spar': minor
'@takeoff-design/tokens': minor
---

Add `Select.Search` — a filter field above a Select's options — and
`Select.Empty` for when nothing matches.

```tsx
<Select.Content>
  <Select.Search value={query} onValueChange={setQuery} />
  <Select.Viewport>
    {visible.map(item => (
      <Select.Item key={item.value} value={item.value} label={item.label}>
        {item.label}
      </Select.Item>
    ))}
    {visible.length === 0 ? <Select.Empty>No results</Select.Empty> : null}
  </Select.Viewport>
</Select.Content>
```

The field takes focus when the list opens. Typing edits the query instead of
running typeahead; arrows, Enter and Escape still drive the list, and the
highlight moves to the first match when the highlighted option is filtered out.
The query resets when the list closes. You filter the items yourself.

With a search present, `Select.Viewport` becomes the listbox and the field the
combobox, so the items must sit inside a `Select.Viewport`. Selects without a
search are unchanged.

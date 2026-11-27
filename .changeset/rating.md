---
'@takeoff-ui/react-spar': minor
'@takeoff-design/tokens': minor
---

Add `Rating` — pick a score from a row of stars, hearts, dots or numbered boxes
(Core `tk-rating`). It is built on Spar's `Radio`, so keyboard, form submission
and `Field` inheritance come for free; the score is a plain `number`.

```tsx
<Rating value={score} onValueChange={setScore} type="star" max={5} showValue />
```

A fractional `value` (e.g. `3.5`) draws a half fill for display; the hover
preview is CSS only. The tokens package ships the `.tk-rating` /
`.tk-rating-item` recipe.

---
'@turkish-technology/spar': minor
'@takeoff-ui/react-spar': minor
'@takeoff-design/tokens': minor
---

Add `Carousel` — the port of Core `tk-carousel`, following the WAI-ARIA carousel
pattern.

```tsx
<Carousel aria-label="Featured destinations" autoplay slidesPerView={1}>
  <Carousel.Viewport>
    <Carousel.Slide>…</Carousel.Slide>
  </Carousel.Viewport>
  <Carousel.Controls />
</Carousel>
```

- Spar ships a new headless `Carousel` primitive
  (`@turkish-technology/spar/carousel`): index state (`value` / `defaultValue` /
  `onValueChange`), `loop`, `slidesPerView`, `orientation`, arrow-key navigation
  (flipped in RTL), and autoplay that pauses on hover and focus, stops from its
  control, starts stopped under `prefers-reduced-motion` and stops on the last
  page without `loop`. Slides outside the window are `inert`.
- `@takeoff-ui/react-spar` adds the styled parts: `Carousel.Viewport`,
  `Carousel.Slide`, `Carousel.Controls`, `Carousel.PrevTrigger`,
  `Carousel.NextTrigger`, `Carousel.Indicators` and `Carousel.AutoplayTrigger`,
  with `controlsPlacement` (`inside` | `outside`), `controlsPosition`
  (`distributed` | `start` | `end`) and localizable `labels`.
- The tokens package adds the `tk-carousel` recipe; the track moves with CSS
  variables only, without layout measurement.

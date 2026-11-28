---
name: takeoff-carousel
description:
  'Build a Carousel that shows slides one step at a time with previous/next
  arrows, page indicators, several slides per view, and optional autoplay with a
  play/pause control. This is the Carousel from @takeoff-ui/react-spar (Takeoff
  UI / Spar React), a compound component with Carousel.Viewport, Carousel.Slide,
  Carousel.Controls, Carousel.PrevTrigger, Carousel.NextTrigger,
  Carousel.Indicators, and Carousel.AutoplayTrigger parts. Use this skill
  WHENEVER building, adding, importing, styling, or fixing a carousel, slider of
  images or cards, slideshow, hero banner rotator, gallery, or migrating
  TkCarousel / tk-carousel in a React app that uses @takeoff-ui/react-spar /
  Takeoff / Spar.'
---

# Carousel — @takeoff-ui/react-spar

`Carousel` shows a set of slides one step at a time. Spar's headless `Carousel`
owns the index, the page model, keyboard, autoplay and ARIA (WAI-ARIA APG
carousel pattern); the wrapper adds the Takeoff track, controls and layout.

**When to use:** rotating banners, image or card galleries, step-through
content. Not for value selection (use `Slider`) or tabbed panels (use `Tabs`).

## Setup

Requires the Takeoff provider + token CSS mounted once at the app root (see the
`takeoff-ui` skill). Then import:

```tsx
import { Carousel } from '@takeoff-ui/react-spar';
```

## Compound parts

- `Carousel` — root `region` (`aria-roledescription="carousel"`). Name it with
  `aria-label` / `aria-labelledby`.
- `Carousel.Viewport` — clips the slides and positions the track (pure CSS, no
  measurement); a polite live region except while rotating.
- `Carousel.Slide` — one slide (`group`, "2 of 5"); off-window slides are
  `inert`. Children may be a function of `{ index, isActive }`.
- `Carousel.Controls` — navigation holder laid out by `controlsPosition`.
  Without children: `PrevTrigger`, `Indicators` (with `AutoplayTrigger` in
  front), `NextTrigger`.
- `Carousel.PrevTrigger` / `Carousel.NextTrigger` — small icon-only Takeoff
  `Button`s; disabled (and hidden) at the ends without `loop`.
- `Carousel.Indicators` — one dot button per page; children go before the dots.
- `Carousel.AutoplayTrigger` — play/pause; renders only with `autoplay`.

## Basic usage

```tsx
<Carousel aria-label="Featured destinations">
  <Carousel.Viewport>
    {destinations.map(d => (
      <Carousel.Slide key={d.id}>
        <img src={d.image} alt={d.name} />
      </Carousel.Slide>
    ))}
  </Carousel.Viewport>
  <Carousel.Controls />
</Carousel>
```

## Examples

### Several slides per view

Navigation moves one slide per step; there is one indicator per start position
(`slides - slidesPerView + 1`).

```tsx
<Carousel
  aria-label="Fares"
  slidesPerView={3}
  loop={false}
  controlsPlacement="outside"
>
  <Carousel.Viewport>{/* slides */}</Carousel.Viewport>
  <Carousel.Controls />
</Carousel>
```

### Autoplay

Pauses on hover and while focus is inside; pressing pause stops it until play is
pressed; starts stopped under `prefers-reduced-motion`; stops on the last page
without `loop`.

```tsx
<Carousel aria-label="Campaigns" autoplay autoplayInterval={5000}>
  <Carousel.Viewport>{/* slides */}</Carousel.Viewport>
  <Carousel.Controls />
</Carousel>
```

### Layout of the controls

```tsx
<Carousel
  aria-label="Gallery"
  controlsPlacement="outside"
  controlsPosition="end"
>
  …
</Carousel>
```

`controlsPosition`: `distributed` (arrows on the sides, dots at the bottom),
`start` / `end` (one bar at the top / bottom; inline-start / inline-end when
vertical).

### Vertical

Give the root a height (default 300px). ArrowUp / ArrowDown navigate.

```tsx
<Carousel aria-label="News" orientation="vertical" style={{ height: 320 }}>
  …
</Carousel>
```

### Controlled

```tsx
const [index, setIndex] = useState(0);
<Carousel aria-label="Steps" value={index} onValueChange={setIndex}>
  …
</Carousel>;
```

`isPlaying` / `defaultPlaying` / `onPlayingChange` control autoplay the same
way.

### Custom controls and labels

```tsx
<Carousel
  aria-label="Galeri"
  autoplay
  labels={{
    previous: 'Önceki slayt',
    next: 'Sonraki slayt',
    indicator: '{index}. slayta git',
    slide: '{index} / {count}',
  }}
>
  <Carousel.Viewport>…</Carousel.Viewport>
  <Carousel.Controls>
    <Carousel.AutoplayTrigger />
    <Carousel.PrevTrigger />
    <Carousel.Indicators />
    <Carousel.NextTrigger />
  </Carousel.Controls>
</Carousel>
```

## Key props

| Prop                                               | Type                                | Default         | Notes                                                                                                 |
| -------------------------------------------------- | ----------------------------------- | --------------- | ----------------------------------------------------------------------------------------------------- |
| `value` / `defaultValue` / `onValueChange`         | `number`                            | `0`             | Index of the first visible slide.                                                                     |
| `loop`                                             | `boolean`                           | `true`          | Wrap from the last page to the first (v1 `circular`).                                                 |
| `slidesPerView`                                    | `number`                            | `1`             | Slides visible at once (v1 `itemsPerView`).                                                           |
| `orientation`                                      | `'horizontal' \| 'vertical'`        | `'horizontal'`  | Axis and arrow keys.                                                                                  |
| `autoplay`                                         | `boolean`                           | `false`         | Advance on its own.                                                                                   |
| `autoplayInterval`                                 | `number`                            | `3000`          | Milliseconds between steps (v1 `autoplayDelay`).                                                      |
| `isPlaying` / `defaultPlaying` / `onPlayingChange` | `boolean`                           | `true`\*        | Autoplay state; \*`false` under reduced motion.                                                       |
| `controlsPlacement`                                | `'inside' \| 'outside'`             | `'inside'`      | Over the slides, or in reserved room.                                                                 |
| `controlsPosition`                                 | `'distributed' \| 'start' \| 'end'` | `'distributed'` | Layout of the controls.                                                                               |
| `labels`                                           | `Partial<CarouselLabels>`           | English         | `previous`, `next`, `play`, `pause`, `indicator`, `slide`, `roleDescription`, `slideRoleDescription`. |
| `id`                                               | `string`                            | generated       | Base id; the viewport is `${id}-viewport`.                                                            |
| `classNames` / `slotProps`                         | per slot                            | –               | Viewport slots: `root`, `track`; Indicators: `root`, `indicator`, `indicatorDot`.                     |

## v1 migration

`circular` → `loop`, `itemsPerView` → `slidesPerView`, `autoplayDelay` →
`autoplayInterval`, `navigationPlacement` → `controlsPlacement`,
`navigationPosition` → `controlsPosition` (`top`/`left` → `start`,
`bottom`/`right` → `end`), `tk-change` → `onValueChange`. `showArrows`,
`showIndicators`, `showPlayerButton`: place or omit the parts inside
`Carousel.Controls`. `verticalViewHeight`: set the root's height.

## Accessibility

- Always name the carousel (`aria-label` / `aria-labelledby`): it is a `region`
  landmark.
- Give images in slides real `alt` text; the slide's own name is only its
  position.
- Do not put the only copy of important content in an auto-rotating slide.
- Arrow keys typed in a text field inside a slide stay with the field.

## Reference

- Live docs: https://v2.takeoffui.com/docs/components/carousel
- Source: `packages/react-spar/src/components/carousel/`, Spar
  `packages/spar/src/components/Carousel/`

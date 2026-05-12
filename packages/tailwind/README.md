# @takeoff-design/tailwind

Tailwind CSS theme package for Takeoff Design. It ships the Tailwind v4 theme CSS and an explicit legacy v3 plugin generated from `@takeoff-design/tokens`.

## Install

```bash
pnpm add @takeoff-design/tailwind @takeoff-design/tokens tailwindcss
```

For GitHub Packages, configure the registry first:

```ini
@takeoff-design:registry=https://npm.pkg.github.com
```

## Tailwind v4

```css
@import '@takeoff-design/tailwind';
```

```css
@import '@takeoff-design/tailwind/v4';
```

## Tailwind v3

```js
const takeoff = require('@takeoff-design/tailwind/v3');

module.exports = {
  plugins: [takeoff],
};
```

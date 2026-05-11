# @takeoff-design/tokens

Design token outputs for Takeoff Design. The package ships generated CSS, SCSS, JavaScript, Tailwind theme assets, fonts CSS, and component recipe styles.

## Install

```bash
pnpm add @takeoff-design/tokens
```

For GitHub Packages, configure the registry first:

```ini
@takeoff-design:registry=https://npm.pkg.github.com
```

## Usage

```css
@import '@takeoff-design/tokens/css/default/theme.css';
```

```scss
@use '@takeoff-design/tokens/scss/variables';
@use '@takeoff-design/tokens/scss/components';
```

```js
import tokens from '@takeoff-design/tokens';
```

```css
@import '@takeoff-design/tokens/tailwind/theme.css';
```

Raw source token JSON and internal sync/build scripts are repository internals and are not part of the npm package contract.

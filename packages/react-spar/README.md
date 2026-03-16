# @takeoff-ui/react-spar

Current-phase React package for Takeoff components backed by
`@turkish-technology/spar`.

## Reference

- Spar documentation: https://spar.app.turkishtechlab.com/
- Spar Button reference:
  https://spar.app.turkishtechlab.com/docs/Components/Button

## Install

`@takeoff-ui/react-spar` currently targets React 19.x only.

```bash
pnpm add @takeoff-ui/react-spar @turkish-technology/spar react react-dom
```

## Usage

```tsx
import '@takeoff-ui/react-spar/styles';
import { Button, ThemeProvider } from '@takeoff-ui/react-spar';

export function Example() {
  return (
    <ThemeProvider>
      <Button type="outlined" variant="secondary">
        Book flight
      </Button>
    </ThemeProvider>
  );
}
```

`ThemeProvider` writes `data-theme`, `data-color-mode`, and `data-density`
attributes into the DOM so the shipped Sass output can react to color mode and
density through the package's semantic global Sass variables.

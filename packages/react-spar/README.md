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
import { Button, SparReactProvider } from '@takeoff-ui/react-spar';

export function Example() {
  return (
    <SparReactProvider>
      <Button type="outlined" variant="secondary">
        Book flight
      </Button>
    </SparReactProvider>
  );
}
```

`SparReactProvider` is the new root provider for the package. It keeps the
existing theme contract alive by writing `data-theme`, `data-color-mode`, and
`data-density`, and also adds `dir`, `lang`, `data-direction`, and `data-locale`
for broader app-level configuration.

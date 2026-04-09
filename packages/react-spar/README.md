# @takeoff-ui/react-spar

Current-phase React package for Takeoff components backed by
`@turkish-technology/spar`.

## Reference

- Spar documentation: https://spar.app.turkishtechlab.com/
- Spar Accordion reference:
  https://spar.app.turkishtechlab.com/docs/Components/Accordion
- Spar Button reference:
  https://spar.app.turkishtechlab.com/docs/Components/Button

## Install

`@takeoff-ui/react-spar` currently targets React 19.x only.

```bash
pnpm add @takeoff-ui/react-spar @takeoff-design/tokens @turkish-technology/spar react react-dom
```

## Usage

```tsx
import '@takeoff-design/tokens/css/default/theme.css';
import {
  Accordion,
  AccordionItem,
  Button,
  SparReactProvider,
} from '@takeoff-ui/react-spar';

export function Example() {
  return (
    <SparReactProvider>
      <Accordion>
        <AccordionItem header="Baggage allowance">
          Review your cabin and checked baggage limits before your trip.
        </AccordionItem>
      </Accordion>

      <Button type="outlined" variant="secondary">
        Manage booking
      </Button>
    </SparReactProvider>
  );
}
```

`@takeoff-ui/react-spar` does not bundle component CSS. Install and import
`@takeoff-design/tokens` once at the app shell or entrypoint.

`SparReactProvider` is the new root provider for the package. It keeps the
existing theme contract alive by writing `data-theme`, `data-color-mode`, and
`data-density`, and also adds `dir`, `lang`, `data-direction`, and `data-locale`
for broader app-level configuration.

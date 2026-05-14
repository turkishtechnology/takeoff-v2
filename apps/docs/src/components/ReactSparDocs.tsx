import { useColorMode } from '@docusaurus/theme-common';
import { type PropsWithChildren } from 'react';
import { Accordion, SparReactProvider, Switch } from '@takeoff-ui/react-spar';

export { Accordion, Switch };

export function ReactSparDemoRoot({ children }: PropsWithChildren) {
  const { colorMode } = useColorMode();

  return <SparReactProvider colorMode={colorMode === 'dark' ? 'dark' : 'light'}>{children}</SparReactProvider>;
}

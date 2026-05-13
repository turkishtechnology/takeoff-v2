import { useColorMode } from '@docusaurus/theme-common';
import { type PropsWithChildren } from 'react';
import { Accordion, Button, Drawer, SparReactProvider, Tooltip } from '@takeoff-ui/react-spar';

export { Accordion, Button, Drawer, Tooltip };

export function ReactSparDemoRoot({ children }: PropsWithChildren) {
  const { colorMode } = useColorMode();

  return <SparReactProvider colorMode={colorMode === 'dark' ? 'dark' : 'light'}>{children}</SparReactProvider>;
}

import { useColorMode } from '@docusaurus/theme-common';
import { type PropsWithChildren } from 'react';
import { Accordion, SparReactProvider } from '@takeoff-ui/react-spar';

export { Accordion };

export function ReactSparDemoRoot({ children }: PropsWithChildren) {
  const { colorMode } = useColorMode();

  return <SparReactProvider colorMode={colorMode === 'dark' ? 'dark' : 'light'}>{children}</SparReactProvider>;
}

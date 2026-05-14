import { useColorMode } from '@docusaurus/theme-common';
import { type PropsWithChildren } from 'react';
import { Accordion, Button, Drawer, Input, Popover, Select, TakeoffSparProvider, Tooltip } from '@takeoff-ui/react-spar';

export { Accordion, Button, Drawer, Input, Popover, Select, Tooltip };

export function ReactSparDemoRoot({ children }: PropsWithChildren) {
  const { colorMode } = useColorMode();

  return <TakeoffSparProvider colorMode={colorMode === 'dark' ? 'dark' : 'light'}>{children}</TakeoffSparProvider>;
}

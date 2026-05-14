import { useColorMode } from '@docusaurus/theme-common';
import { type PropsWithChildren } from 'react';
import { Accordion, Badge, Button, Drawer, Input, Popover, Radio, Select, Switch, TakeoffSparProvider, Tooltip } from '@takeoff-ui/react-spar';

export { Accordion, Badge, Button, Drawer, Input, Popover, Radio, Select, Switch, Tooltip };

export function ReactSparDemoRoot({ children }: PropsWithChildren) {
  const { colorMode } = useColorMode();

  return <TakeoffSparProvider colorMode={colorMode === 'dark' ? 'dark' : 'light'}>{children}</TakeoffSparProvider>;
}

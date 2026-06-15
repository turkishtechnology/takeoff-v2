import { useColorMode } from '@docusaurus/theme-common';
import { type PropsWithChildren } from 'react';
import { Accordion, Badge, Button, Checkbox, Drawer, Field, Input, Popover, Radio, Select, Switch, Tabs, TakeoffSparProvider, Tooltip } from '@takeoff-ui/react-spar';

export { Accordion, Badge, Button, Checkbox, Drawer, Field, Input, Popover, Radio, Select, Switch, Tabs, Tooltip };

export function ReactSparDemoRoot({ children }: PropsWithChildren) {
  const { colorMode } = useColorMode();

  return <TakeoffSparProvider colorMode={colorMode === 'dark' ? 'dark' : 'light'}>{children}</TakeoffSparProvider>;
}

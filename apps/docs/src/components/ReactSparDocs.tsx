import { useColorMode } from '@docusaurus/theme-common';
import { type PropsWithChildren } from 'react';
import {
  Accordion,
  Alert,
  Badge,
  Breadcrumb,
  Button,
  Card,
  Checkbox,
  Chip,
  Dialog,
  Drawer,
  Field,
  Input,
  Label,
  Popover,
  Radio,
  Select,
  Spinner,
  Switch,
  Tabs,
  TakeoffSparProvider,
  Toast,
  Toaster,
  Tooltip,
  createToaster,
} from '@takeoff-ui/react-spar';

export {
  Accordion,
  Alert,
  Badge,
  Breadcrumb,
  Button,
  Card,
  Checkbox,
  Chip,
  Dialog,
  Drawer,
  Field,
  Input,
  Label,
  Popover,
  Radio,
  Select,
  Spinner,
  Switch,
  Tabs,
  Toast,
  Toaster,
  Tooltip,
  createToaster,
};

export function ReactSparDemoRoot({ children }: PropsWithChildren) {
  const { colorMode } = useColorMode();

  return <TakeoffSparProvider colorMode={colorMode === 'dark' ? 'dark' : 'light'}>{children}</TakeoffSparProvider>;
}

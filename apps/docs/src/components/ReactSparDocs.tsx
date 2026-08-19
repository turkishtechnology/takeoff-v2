import { useColorMode } from '@docusaurus/theme-common';
import { type PropsWithChildren } from 'react';
import { TakeoffSparProvider } from '@takeoff-ui/react-spar';

// Re-export Spar components straight from the package with the aggregate
// `export … from` form. The previous "import the bindings, then `export { … }`"
// pattern hid these names from webpack's static export analysis, so every MDX
// that imported a component through `@site/src/components/ReactSparDocs` logged
// an `export '…' was not found` warning at build time.
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
  Divider,
  Drawer,
  Dropdown,
  Field,
  Input,
  Label,
  Popover,
  Progress,
  Radio,
  Select,
  Skeleton,
  Slider,
  Spinner,
  Stepper,
  Switch,
  Table,
  Tabs,
  TakeoffSparProvider,
  Toast,
  Toaster,
  Tooltip,
  Upload,
  createToaster,
} from '@takeoff-ui/react-spar';

export function ReactSparDemoRoot({ children }: PropsWithChildren) {
  const { colorMode } = useColorMode();

  return <TakeoffSparProvider colorMode={colorMode === 'dark' ? 'dark' : 'light'}>{children}</TakeoffSparProvider>;
}

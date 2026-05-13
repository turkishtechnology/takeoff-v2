import { Drawer as DrawerRoot } from './Drawer';
import { DrawerTrigger } from './DrawerTrigger';
import { DrawerOverlay } from './DrawerOverlay';
import { DrawerPanel } from './DrawerPanel';
import { DrawerHeader } from './DrawerHeader';
import { DrawerTitle } from './DrawerTitle';
import { DrawerDescription } from './DrawerDescription';
import { DrawerBody } from './DrawerBody';
import { DrawerFooter } from './DrawerFooter';
import { DrawerCloseButton } from './DrawerCloseButton';

const Drawer = Object.assign(DrawerRoot, {
  Trigger: DrawerTrigger,
  Overlay: DrawerOverlay,
  Panel: DrawerPanel,
  Header: DrawerHeader,
  Title: DrawerTitle,
  Description: DrawerDescription,
  Body: DrawerBody,
  Footer: DrawerFooter,
  CloseButton: DrawerCloseButton,
});

export { Drawer };

export type {
  DrawerBodyProps,
  DrawerCloseButtonProps,
  DrawerDescriptionProps,
  DrawerFooterProps,
  DrawerHeaderProps,
  DrawerOverlayProps,
  DrawerPanelProps,
  DrawerPlacement,
  DrawerProps,
  DrawerTitleProps,
  DrawerTriggerProps,
} from './types';

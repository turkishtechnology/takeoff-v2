import { Dialog as DialogRoot } from './Dialog';
import { DialogTrigger } from './DialogTrigger';
import { DialogOverlay } from './DialogOverlay';
import { DialogContent } from './DialogContent';
import { DialogHeader } from './DialogHeader';
import { DialogTitle } from './DialogTitle';
import { DialogDescription } from './DialogDescription';
import { DialogFooter } from './DialogFooter';
import { DialogClose } from './DialogClose';

const Dialog = Object.assign(DialogRoot, {
  Trigger: DialogTrigger,
  Overlay: DialogOverlay,
  Content: DialogContent,
  Header: DialogHeader,
  Title: DialogTitle,
  Description: DialogDescription,
  Footer: DialogFooter,
  Close: DialogClose,
});

export { Dialog };

export type {
  DialogCloseProps,
  DialogCloseSlot,
  DialogContentProps,
  DialogContentSlot,
  DialogDescriptionProps,
  DialogDescriptionSlot,
  DialogFooterProps,
  DialogFooterSlot,
  DialogHeaderProps,
  DialogHeaderSlot,
  DialogHeaderType,
  DialogVariant,
  DialogOverlayIntensity,
  DialogOverlayProps,
  DialogOverlaySlot,
  DialogProps,
  DialogTitleProps,
  DialogTitleSlot,
  DialogTriggerProps,
  DialogTriggerSlot,
} from './types';

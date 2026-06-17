import { Dialog as DialogRoot } from './Dialog';
import { DialogTrigger } from './DialogTrigger';
import { DialogOverlay } from './DialogOverlay';
import { DialogPanel } from './DialogPanel';
import { DialogHeader } from './DialogHeader';
import { DialogTitle } from './DialogTitle';
import { DialogDescription } from './DialogDescription';
import { DialogBody } from './DialogBody';
import { DialogFooter } from './DialogFooter';
import { DialogClose } from './DialogClose';

const Dialog = Object.assign(DialogRoot, {
  Trigger: DialogTrigger,
  Overlay: DialogOverlay,
  Panel: DialogPanel,
  Header: DialogHeader,
  Title: DialogTitle,
  Description: DialogDescription,
  Body: DialogBody,
  Footer: DialogFooter,
  Close: DialogClose,
});

export { Dialog };

export type {
  DialogBodyProps,
  DialogBodySlot,
  DialogCloseProps,
  DialogCloseSlot,
  DialogPanelProps,
  DialogPanelSlot,
  DialogDescriptionProps,
  DialogDescriptionSlot,
  DialogFooterProps,
  DialogFooterSlot,
  DialogFooterType,
  DialogHeaderProps,
  DialogHeaderSlot,
  DialogHeaderType,
  DialogOverlayIntensity,
  DialogOverlayProps,
  DialogOverlaySlot,
  DialogProps,
  DialogTitleProps,
  DialogTitleSlot,
  DialogTriggerProps,
  DialogTriggerSlot,
} from './types';

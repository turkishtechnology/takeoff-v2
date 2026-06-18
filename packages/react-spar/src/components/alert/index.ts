import { Alert as AlertRoot } from './Alert';
import { AlertActions } from './AlertActions';
import { AlertClose } from './AlertClose';
import { AlertContent } from './AlertContent';
import { AlertDescription } from './AlertDescription';
import { AlertTitle } from './AlertTitle';

const Alert = Object.assign(AlertRoot, {
  Content: AlertContent,
  Title: AlertTitle,
  Description: AlertDescription,
  Actions: AlertActions,
  Close: AlertClose,
});

export { Alert };

export type {
  AlertActionsProps,
  AlertActionsSlot,
  AlertAppearance,
  AlertCloseProps,
  AlertCloseSlot,
  AlertContentProps,
  AlertContentSlot,
  AlertDescriptionProps,
  AlertDescriptionSlot,
  AlertProps,
  AlertSlot,
  AlertTitleProps,
  AlertTitleSlot,
  AlertVariant,
} from './types';

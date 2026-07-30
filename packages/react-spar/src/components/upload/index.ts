import { Upload as UploadRoot } from './Upload';
import { UploadDropzone } from './UploadDropzone';
import { UploadItem } from './UploadItem';
import { UploadItemAction } from './UploadItemAction';
import { UploadItemActions } from './UploadItemActions';
import { UploadItemContent } from './UploadItemContent';
import { UploadItemPreview } from './UploadItemPreview';
import { UploadList } from './UploadList';
import { UploadSubmit } from './UploadSubmit';
import { UploadTrigger } from './UploadTrigger';

const Upload = Object.assign(UploadRoot, {
  Dropzone: UploadDropzone,
  Trigger: UploadTrigger,
  Submit: UploadSubmit,
  List: UploadList,
  Item: UploadItem,
  ItemPreview: UploadItemPreview,
  ItemContent: UploadItemContent,
  ItemActions: UploadItemActions,
  ItemAction: UploadItemAction,
});

export { Upload };

// No value exports: an `UploadFile` is a plain object, so a consumer builds one
// with an object literal and updates it by spreading. Nothing here encodes a
// contract they cannot express in the language itself.
export type {
  UploadFile,
  UploadFileStatus,
  UploadDropzoneProps,
  UploadDropzoneSlot,
  UploadItemActionProps,
  UploadItemActionSlot,
  UploadItemActionsProps,
  UploadItemActionsSlot,
  UploadItemContentProps,
  UploadItemContentSlot,
  UploadItemPreviewProps,
  UploadItemPreviewSlot,
  UploadItemPreviewSlotProps,
  UploadItemProps,
  UploadItemSlot,
  UploadListProps,
  UploadListSlot,
  UploadProps,
  UploadRejection,
  UploadSlot,
  UploadSubmitProps,
  UploadSubmitSlot,
  UploadTriggerProps,
  UploadTriggerSlot,
} from './types';

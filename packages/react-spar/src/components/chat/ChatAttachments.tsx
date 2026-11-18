import { useEffect, useState } from 'react';

import { formatLabel } from '../../utils';
import { Upload } from '../upload';
import { fileName, fileType, isImageType } from '../upload/helpers';

import { useChatContext } from './context';
import type { ChatAttachment } from './types';

type SlotAttrs = Record<string, unknown>;

/** Uploaded (or never tracked): an image can show as a picture. */
const isSettled = (attachment: ChatAttachment) => attachment.status === undefined || attachment.status === 'idle' || attachment.status === 'completed';

const showsAsImage = (attachment: ChatAttachment) =>
  isSettled(attachment) && (Boolean(attachment.thumbUrl) || (isImageType(fileType(attachment)) && Boolean(attachment.url ?? attachment.file)));

/** An object URL for a local file, revoked when the file changes or the row goes. */
const useObjectUrl = (file: File | undefined) => {
  const [url, setUrl] = useState<string>();
  useEffect(() => {
    if (!file) return;
    const next = URL.createObjectURL(file);
    setUrl(next);
    return () => {
      URL.revokeObjectURL(next);
      setUrl(undefined);
    };
  }, [file]);
  return url;
};

const ChatImage = ({ attachment, attrs }: { attachment: ChatAttachment; attrs: SlotAttrs }) => {
  const { labels } = useChatContext('Chat.Message');
  // A server copy wins; the local file covers the moment before it exists.
  const local = useObjectUrl(attachment.url ? undefined : attachment.file);
  const href = attachment.url ?? local;
  const src = attachment.thumbUrl ?? href;
  return (
    <a {...attrs} href={href} target="_blank" rel="noreferrer" aria-label={formatLabel(labels.openAttachment, { name: fileName(attachment) })}>
      {src && <img src={src} alt="" loading="lazy" />}
    </a>
  );
};

/**
 * A message's files: images as previews, everything else — and any file still
 * uploading or failed — as Upload rows with their status and a download.
 */
export const ChatAttachments = ({ attachments, root, image }: { attachments: ChatAttachment[]; root: SlotAttrs; image: SlotAttrs }) => {
  const { labels } = useChatContext('Chat.Message');
  const images = attachments.filter(showsAsImage);
  // A finished upload needs no "Completed" line under it in a conversation.
  const files = attachments
    .filter(attachment => !showsAsImage(attachment))
    .map(attachment => (attachment.status === 'completed' ? { ...attachment, status: 'idle' as const } : attachment));

  return (
    <div {...root}>
      {images.map(attachment => (
        <ChatImage key={attachment.id} attachment={attachment} attrs={image} />
      ))}
      {files.length > 0 && (
        <Upload
          readOnly
          value={files}
          downloadLabel={labels.downloadAttachment}
          uploadingLabel={labels.uploading}
          processingLabel={labels.uploading}
          errorLabel={labels.uploadFailed}
          progressLabel={labels.uploadProgress}
        >
          <Upload.List />
        </Upload>
      )}
    </div>
  );
};

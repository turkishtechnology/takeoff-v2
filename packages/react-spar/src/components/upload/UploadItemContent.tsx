import type { ElementType, ReactNode, Ref } from 'react';
import { CheckCircleIconFilledRounded } from '@takeoff-icons/react/check-circle';
import { CloseCircleIconFilledRounded } from '@takeoff-icons/react/close-circle';

import { buildSlotAttrs, composeRootAttrs, isRenderableNode } from '../../core';
import { useComponentTheme } from '../../provider';
import { Progress } from '../progress';
import { Spinner } from '../spinner';

import { UploadItemContentBase } from './base';
import { useUploadContext, useUploadItemContext, type UploadContextValue } from './context';
import { fileName, fileSize, fileStatus, formatFileLabel, formatFileSize } from './helpers';
import type { UploadFileStatus, UploadItemContentOwnProps, UploadItemContentProps, UploadItemContentSlot } from './types';

type UploadItemContentResolvedProps = Omit<UploadItemContentOwnProps, 'classNames' | 'slotProps'> & {
  as?: ElementType;
  children?: ReactNode;
  ref?: Ref<Element>;
};

// The status line reads as support text (Figma "Support Text", state=loading /
// completed): a 16px glyph and a label beside it, rather than a bare icon whose
// meaning only a screen reader gets. The root's four label props reach here
// keyed by status, so this is a lookup rather than a mapping. `idle` says
// nothing — a file that is just sitting in the list needs no commentary, which
// is why the root ships no label for it either.
const statusLabelOf = (status: UploadFileStatus, statusLabels: UploadContextValue['statusLabels']): string | null => (status === 'idle' ? null : statusLabels[status]);

const statusIcon = (status: UploadFileStatus): ReactNode => {
  switch (status) {
    case 'uploading':
    case 'processing':
      // The circular spinner of the design's loading state — `info` so the arc
      // reads as in-progress rather than as a result, and decorative because
      // the label next to it already names the state (an announcing spinner
      // would double it up). Both in-flight statuses share it; what separates
      // them is the label, and the bar that only `uploading` can draw.
      return <Spinner size="small" appearance="rounded" variant="info" aria-hidden="true" />;
    case 'completed':
      return <CheckCircleIconFilledRounded aria-hidden="true" focusable="false" />;
    case 'error':
      return <CloseCircleIconFilledRounded aria-hidden="true" focusable="false" />;
    default:
      return null;
  }
};

export const UploadItemContent = <T extends ElementType = 'div'>(props: UploadItemContentProps<T>) => {
  const theme = useComponentTheme('UploadItemContent');
  const { item } = useUploadItemContext('Upload.ItemContent');
  const { statusLabels, progressLabel } = useUploadContext('Upload.ItemContent');

  const { rootAttrs, rest } = composeRootAttrs(UploadItemContentBase, props as UploadItemContentProps<'div'>, theme);
  const { as, children, ref, ...nativeProps } = rest as UploadItemContentResolvedProps;

  const slotAttrs = (slot: UploadItemContentSlot) =>
    buildSlotAttrs(UploadItemContentBase.getSlotProps(slot), slot, {
      themeSlotProps: theme?.slotProps,
      themeClassNames: theme?.classNames,
      instanceSlotProps: props.slotProps,
      instanceClassNames: props.classNames,
    });

  const Component = (as ?? 'div') as ElementType;
  const name = fileName(item);
  const size = fileSize(item);
  const status = fileStatus(item);
  const icon = statusIcon(status);
  const statusLabel = statusLabelOf(status, statusLabels);
  // The failure's own message is the useful support text; the generic label is
  // only there for an entry that reports no reason.
  const statusText = status === 'error' ? (item.error ?? statusLabel) : statusLabel;

  // What the row says about the file: its name, its size, how the upload is
  // going. Passing children replaces the set rather than adding to it — same
  // rule as the preview and the action area.
  const defaultContent = (
    <>
      <span {...slotAttrs('name')}>{name}</span>
      {/* No size, no line. `size` is optional on an entry and a remote one has
          no bytes to read it off, so a server-side attachment whose byte count
          the API does not return has none at all — and "0 byte" is not the
          absence of a size, it is the claim that the file is empty. */}
      {size !== undefined && <span {...slotAttrs('size')}>{formatFileSize(size)}</span>}
      {icon && statusText ? (
        // Icon plus its label, as one line: the glyph is decorative and the
        // text carries the meaning, so nothing here needs an aria-label of its
        // own. `title` keeps a long failure message reachable in full while the
        // line itself stays one row high.
        //
        // No text, no line — a status label emptied at the root takes the glyph
        // with it. The alternative is a lone `aria-hidden` icon: a mark that
        // says something to sighted users and nothing to anyone else, which is
        // the split this line exists to avoid.
        <span {...slotAttrs('status')} title={status === 'error' ? item.error : undefined}>
          {icon}
          {statusText}
        </span>
      ) : null}
      {status === 'uploading' && typeof item.progress === 'number' && (
        // The bar is the *determinate* face of uploading — it only appears once
        // there is a percentage to show. Without one, the spinner and its
        // "Uploading…" label above are already the indeterminate indicator, so
        // a second (looping) bar would say the same thing twice. `processing`
        // never gets one: a server-side step reports that it is running, not
        // how far along it is.
        <div {...slotAttrs('progress')}>
          {/* Named per file, like the row's actions: several rows can upload at
              once, and three bars all called "Upload progress" are the same
              control to a screen reader. */}
          <Progress value={item.progress} size="small" aria-label={formatFileLabel(progressLabel, name)} />
        </div>
      )}
    </>
  );

  return (
    <Component {...nativeProps} {...rootAttrs} ref={ref}>
      {isRenderableNode(children) ? children : defaultContent}
    </Component>
  );
};

UploadItemContent.displayName = 'Upload.ItemContent';

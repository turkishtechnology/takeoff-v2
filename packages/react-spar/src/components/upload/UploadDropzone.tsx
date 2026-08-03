import { useRef, useState, type DragEvent, type ElementType, type ReactNode, type Ref } from 'react';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { UploadDropzoneBase } from './base';
import { useUploadContext } from './context';
import { acceptMatchesType } from './helpers';
import type { UploadDropzoneOwnProps, UploadDropzoneProps } from './types';

type UploadDropzoneResolvedProps = Omit<UploadDropzoneOwnProps, 'classNames' | 'slotProps'> & {
  as?: ElementType;
  children?: ReactNode;
  ref?: Ref<Element>;
  onDragEnter?: (event: DragEvent<HTMLElement>) => void;
  onDragOver?: (event: DragEvent<HTMLElement>) => void;
  onDragLeave?: (event: DragEvent<HTMLElement>) => void;
  onDrop?: (event: DragEvent<HTMLElement>) => void;
};

type DragState = 'accept' | 'reject';

const dragStateFor = (event: DragEvent<HTMLElement>, accept: string | undefined): DragState => {
  const items = event.dataTransfer?.items;
  if (!items || items.length === 0) return 'accept';
  for (const item of Array.from(items)) {
    if (item.kind === 'file' && !acceptMatchesType(item.type, accept)) return 'reject';
  }
  return 'accept';
};

export const UploadDropzone = <T extends ElementType = 'div'>(props: UploadDropzoneProps<T>) => {
  const theme = useComponentTheme('UploadDropzone');
  const { disabled, readOnly, accept, processFiles } = useUploadContext('Upload.Dropzone');

  const { rootAttrs, rest } = composeRootAttrs(UploadDropzoneBase, props as UploadDropzoneProps<'div'>, theme);
  const { as, children, ref, onDragEnter, onDragOver, onDragLeave, onDrop, ...nativeProps } = rest as UploadDropzoneResolvedProps;

  const [dragState, setDragState] = useState<DragState | null>(null);
  // Enter/leave fire for every descendant; a depth counter keeps `data-drag-state`
  // from flickering as the pointer crosses child nodes inside the zone.
  const depth = useRef(0);
  const active = !disabled && !readOnly;

  // Claiming the drop is not the same as acting on it, so the two `preventDefault`
  // calls that make this element a drop target run ahead of the `active` check,
  // unconditionally. A zone that does not claim the drop does not stop it: it
  // falls through to the document, where the browser's own handler navigates the
  // tab to the dropped file — the app is replaced and every unsaved form on the
  // page goes with it. A disabled or read-only zone therefore still swallows the
  // payload; what it stops doing is committing it (the guards below).
  const handleDragEnter = (event: DragEvent<HTMLElement>) => {
    onDragEnter?.(event);
    event.preventDefault();
    if (!active) return;
    depth.current += 1;
    setDragState(dragStateFor(event, accept));
  };

  const handleDragOver = (event: DragEvent<HTMLElement>) => {
    onDragOver?.(event);
    // Required for the element to become a valid drop target.
    event.preventDefault();
    if (!active) return;
    // `dragover` fires every few frames for as long as the pointer hovers, and
    // the payload cannot change without a `dragleave` first — so the state is
    // computed once per hover. The scan still runs here when there was no
    // `dragenter` to compute it (a drag that begins inside the zone).
    if (dragState === null) setDragState(dragStateFor(event, accept));
  };

  const handleDragLeave = (event: DragEvent<HTMLElement>) => {
    onDragLeave?.(event);
    // The reset is unconditional: a control that goes disabled or read-only
    // mid-drag still has to let go of `data-drag-state`, or the zone keeps its
    // accept/reject border painted on for good. Only what acts on the payload
    // is gated on `active`.
    depth.current = Math.max(0, depth.current - 1);
    if (depth.current === 0) setDragState(null);
    if (!active) return;
    event.preventDefault();
  };

  const handleDrop = (event: DragEvent<HTMLElement>) => {
    onDrop?.(event);
    // Read before this part's own `preventDefault` below, or the veto would
    // always look set.
    const cancelled = event.defaultPrevented;
    event.preventDefault();
    depth.current = 0;
    setDragState(null);
    if (!active) return;
    // The built-in commit runs after the consumer's handler unless they
    // cancelled it — the same veto the Trigger and ItemAction honour, which is
    // how a consumer routes a drop through their own uploader instead.
    if (cancelled) return;
    if (event.dataTransfer?.files?.length) processFiles(event.dataTransfer.files);
  };

  const Component = (as ?? 'div') as ElementType;

  return (
    <Component
      {...nativeProps}
      {...rootAttrs}
      data-drag-state={dragState ?? undefined}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      ref={ref}
    >
      {children}
    </Component>
  );
};

UploadDropzone.displayName = 'Upload.Dropzone';

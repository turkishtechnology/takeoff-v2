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
  // Compose `slotProps.root`'s drag handlers rather than letting the four
  // explicit ones below (spread last) silently drop them — the Trigger/Submit/
  // ItemAction rule, which the zone was the one part left out of. Each runs
  // right after the prop-level handler of the same name, so the two override
  // routes agree: both see the event before this part acts on it.
  const {
    onDragEnter: slotOnDragEnter,
    onDragOver: slotOnDragOver,
    onDragLeave: slotOnDragLeave,
    onDrop: slotOnDrop,
    ...dropzoneRootAttrs
  } = rootAttrs as typeof rootAttrs & {
    onDragEnter?: (event: DragEvent<HTMLElement>) => void;
    onDragOver?: (event: DragEvent<HTMLElement>) => void;
    onDragLeave?: (event: DragEvent<HTMLElement>) => void;
    onDrop?: (event: DragEvent<HTMLElement>) => void;
  };
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
    slotOnDragEnter?.(event);
    event.preventDefault();
    if (!active) return;
    depth.current += 1;
    setDragState(dragStateFor(event, accept));
  };

  const handleDragOver = (event: DragEvent<HTMLElement>) => {
    onDragOver?.(event);
    slotOnDragOver?.(event);
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
    slotOnDragLeave?.(event);
    // The reset is unconditional: a control that goes disabled or read-only
    // mid-drag still has to let go of `data-drag-state`, or the zone keeps its
    // accept/reject border painted on for good. There is nothing to gate on
    // `active` beside it — `dragleave` has no cancelable default to claim (the
    // enter/over/drop trio is where the target is claimed and the payload acted
    // on), so letting go of the hint is all this handler does.
    depth.current = Math.max(0, depth.current - 1);
    if (depth.current === 0) setDragState(null);
  };

  const handleDrop = (event: DragEvent<HTMLElement>) => {
    onDrop?.(event);
    slotOnDrop?.(event);
    event.preventDefault();
    depth.current = 0;
    setDragState(null);
    if (!active) return;
    // No `preventDefault()` veto here, unlike the Trigger and the ItemAction.
    // On a click, preventing the default is a deliberate act and reads as one;
    // on a drop it is the boilerplate every drag-and-drop tutorial opens with —
    // it is how you stop the browser from navigating to the dropped file, and
    // most consumers write it by reflex. Honouring it as a veto turned that
    // reflex into a zone that silently accepts nothing, with no error and the
    // accept state still painting. The commit is unconditional, and control
    // over what lands stays where the rest of the value contract lives: the
    // root's `onValueChange` (and `value`) sees the batch before it is kept.
    if (event.dataTransfer?.files?.length) processFiles(event.dataTransfer.files);
  };

  const Component = (as ?? 'div') as ElementType;

  return (
    <Component
      {...nativeProps}
      {...dropzoneRootAttrs}
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

import type { ElementType, ReactNode, Ref } from 'react';

import { composeRootAttrs, isRenderableNode } from '../../core';
import { useComponentTheme } from '../../provider';

import { UploadItemActionsBase } from './base';
import { useUploadContext, useUploadItemContext } from './context';
import { canSaveUploadFile } from './helpers';
import { UploadItemAction } from './UploadItemAction';
import type { UploadItemActionsOwnProps, UploadItemActionsProps } from './types';

type UploadItemActionsResolvedProps = Omit<UploadItemActionsOwnProps, 'classNames' | 'slotProps'> & {
  as?: ElementType;
  children?: ReactNode;
  ref?: Ref<Element>;
};

export const UploadItemActions = <T extends ElementType = 'div'>(props: UploadItemActionsProps<T>) => {
  const theme = useComponentTheme('UploadItemActions');
  const { readOnly } = useUploadContext('Upload.ItemActions');
  const { item } = useUploadItemContext('Upload.ItemActions');

  const { rootAttrs, rest } = composeRootAttrs(UploadItemActionsBase, props as UploadItemActionsProps<'div'>, theme);
  const { as, children, ref, ...nativeProps } = rest as UploadItemActionsResolvedProps;

  const Component = (as ?? 'div') as ElementType;

  // Which of the default pair this row actually has an action for. Both can drop
  // out — read-only takes the remove away, and an entry with neither `file` nor
  // `url` has nothing to hand the browser — and the same two answers decide the
  // container as well as its contents, so the pair and the box below cannot
  // disagree about whether there is anything here.
  const hasChildren = isRenderableNode(children);
  const showDownload = canSaveUploadFile(item);
  const showRemove = !readOnly;

  // Nothing to hold, nothing to render: the recipe gives this box
  // `margin-inline-start: auto` and a `gap`, so an empty one still claims the
  // row's trailing space and still breaks `:empty` styling further out.
  if (!hasChildren && !showDownload && !showRemove) return null;

  return (
    <Component {...nativeProps} {...rootAttrs} ref={ref}>
      {/* The default set: save the file, or drop it. Both are built-in actions,
          so the default row needs no wiring — and passing children replaces the
          pair rather than adding to it. */}
      {hasChildren ? (
        children
      ) : (
        <>
          {showDownload && <UploadItemAction action="download" />}
          {showRemove && <UploadItemAction action="remove" />}
        </>
      )}
    </Component>
  );
};

UploadItemActions.displayName = 'Upload.ItemActions';

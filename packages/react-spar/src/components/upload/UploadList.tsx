import { type ElementType, type Ref } from 'react';

import { composeRootAttrs, isRenderableNode } from '../../core';
import { useComponentTheme } from '../../provider';

import { UploadListBase } from './base';
import { useUploadContext } from './context';
import { UploadItem } from './UploadItem';
import type { UploadListOwnProps, UploadListProps } from './types';

type UploadListResolvedProps = Omit<UploadListOwnProps, 'classNames' | 'slotProps'> & {
  as?: ElementType;
  ref?: Ref<Element>;
};

export const UploadList = <T extends ElementType = 'div'>(props: UploadListProps<T>) => {
  const theme = useComponentTheme('UploadList');
  const { files } = useUploadContext('Upload.List');

  const { rootAttrs, rest } = composeRootAttrs(UploadListBase, props as UploadListProps<'div'>, theme);
  const { as, children, ref, ...nativeProps } = rest as UploadListResolvedProps;

  // Empty list renders nothing — the region only exists once there are files.
  if (files.length === 0) return null;

  const Component = (as ?? 'div') as ElementType;
  // The consumer owns the map (function form), so each row's file — and every
  // action closing over it — is explicit. Omitting children keeps the default
  // list: one bare row per file. A conditional that renders nothing (`false`,
  // `''`) counts as omitted rather than as an empty list, so a toggled-off row
  // set falls back to the default instead of blanking the region.
  const rows = typeof children === 'function' ? children(files) : isRenderableNode(children) ? children : files.map(item => <UploadItem key={item.id} file={item} />);

  return (
    <Component {...nativeProps} {...rootAttrs} ref={ref}>
      {rows}
    </Component>
  );
};

UploadList.displayName = 'Upload.List';

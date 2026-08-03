import type { ElementType, ReactNode, Ref } from 'react';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { UploadActionsBase } from './base';
import { useUploadContext } from './context';
import type { UploadActionsOwnProps, UploadActionsProps } from './types';

type UploadActionsResolvedProps = Omit<UploadActionsOwnProps, 'classNames' | 'slotProps'> & {
  as?: ElementType;
  children?: ReactNode;
  ref?: Ref<Element>;
};

export const UploadActions = <T extends ElementType = 'div'>(props: UploadActionsProps<T>) => {
  const theme = useComponentTheme('UploadActions');
  // Read for the guard alone — the part has no behavior to draw from the root.
  // Every other part throws when it is written outside an `Upload`, and this one
  // is the outermost of the group it holds, so its message is the one that names
  // the actual mistake; without it a misplaced Actions renders and the Trigger
  // inside it throws, pointing at the wrong part.
  useUploadContext('Upload.Actions');

  const { rootAttrs, rest } = composeRootAttrs(UploadActionsBase, props as UploadActionsProps<'div'>, theme);
  const { as, children, ref, ...nativeProps } = rest as UploadActionsResolvedProps;

  const Component = (as ?? 'div') as ElementType;

  // A layout box and nothing more: it holds what it is given, in the order it is
  // given. The zone stacks its children, so anything meant to share a line —
  // Browse beside Send being the case it exists for — needs a row of its own.
  return (
    <Component {...nativeProps} {...rootAttrs} ref={ref}>
      {children}
    </Component>
  );
};

UploadActions.displayName = 'Upload.Actions';

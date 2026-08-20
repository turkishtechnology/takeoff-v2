import { Children, Fragment, isValidElement, type ElementType, type ReactNode, type Ref } from 'react';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { UploadItemBase } from './base';
import { UploadItemProvider } from './context';
import { fileStatus } from './helpers';
import { UploadItemActions } from './UploadItemActions';
import { UploadItemContent } from './UploadItemContent';
import { UploadItemPreview } from './UploadItemPreview';
import type { UploadItemOwnProps, UploadItemProps } from './types';

type UploadItemResolvedProps = Omit<UploadItemOwnProps, 'classNames' | 'slotProps'> & {
  as?: ElementType;
  children?: ReactNode;
  ref?: Ref<Element>;
};

/**
 * The row's children, one level of grouping at a time: a fragment is a way of
 * writing several children in one place, not a child of its own, so the regions
 * inside one are still the row's to hoist. `Children.forEach` already flattens
 * arrays; fragments it hands over whole, which is why they are unwrapped here.
 *
 * A region behind a *component* boundary cannot be reached this way — nothing can
 * see what `<Regions />` will return before it renders — so the three region
 * parts have to be written in the row, whether directly or inside a fragment.
 */
const flattenRowChildren = (children: ReactNode, out: ReactNode[] = []): ReactNode[] => {
  Children.forEach(children, child => {
    if (isValidElement(child) && child.type === Fragment) flattenRowChildren((child.props as { children?: ReactNode }).children, out);
    else out.push(child);
  });
  return out;
};

export const UploadItem = <T extends ElementType = 'div'>(props: UploadItemProps<T>) => {
  const theme = useComponentTheme('UploadItem');

  const { rootAttrs, rest } = composeRootAttrs(UploadItemBase, props as UploadItemProps<'div'>, theme);
  const { as, file: item, children, ref, ...nativeProps } = rest as UploadItemResolvedProps;

  const Component = (as ?? 'div') as ElementType;

  // The row is three regions in a fixed order — preview, content, actions — so a
  // composed `Upload.ItemPreview` / `Upload.ItemContent` / `Upload.ItemActions`
  // is hoisted out of the children into its own position (replacing that
  // region's default) wherever it was written. Matched by component reference,
  // not displayName, so a minified build still detects it — mirrors
  // AccordionTrigger's child partitioning.
  const previewNodes: ReactNode[] = [];
  const contentNodes: ReactNode[] = [];
  const actionsNodes: ReactNode[] = [];
  const looseNodes: ReactNode[] = [];
  for (const child of flattenRowChildren(children)) {
    const type = isValidElement(child) ? child.type : undefined;
    if (type === UploadItemPreview) previewNodes.push(child);
    else if (type === UploadItemContent) contentNodes.push(child);
    else if (type === UploadItemActions) actionsNodes.push(child);
    else looseNodes.push(child);
  }

  // Bare action children are the common case, so they are wrapped in the default
  // container — writing `Upload.ItemActions` is only needed to style or move it.
  // With one composed, anything else stays where it was written, in the row.
  const hasComposedActions = actionsNodes.length > 0;
  const actionsRegion = hasComposedActions ? actionsNodes : <UploadItemActions>{looseNodes.length > 0 ? looseNodes : undefined}</UploadItemActions>;

  return (
    // The row publishes its own file to its parts, so an `Upload.ItemAction`,
    // `Upload.ItemContent`, or `Upload.ItemPreview` needs no per-instance wiring
    // to know which entry it renders.
    <UploadItemProvider value={{ item }}>
      <Component {...nativeProps} {...rootAttrs} data-status={fileStatus(item)} ref={ref}>
        {previewNodes.length > 0 ? previewNodes : <UploadItemPreview />}
        {contentNodes.length > 0 ? contentNodes : <UploadItemContent />}
        {hasComposedActions && looseNodes}
        {actionsRegion}
      </Component>
    </UploadItemProvider>
  );
};

UploadItem.displayName = 'Upload.Item';

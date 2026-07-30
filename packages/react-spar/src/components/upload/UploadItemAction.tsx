import type { ElementType, MouseEvent, ReactNode, Ref } from 'react';

import { ArrowDownloadIconOutlinedRounded } from '@takeoff-icons/react/arrow-download';
import { CloseIconOutlinedRounded } from '@takeoff-icons/react/close';

import { composeRootAttrs, isRenderableNode } from '../../core';
import { useComponentTheme } from '../../provider';
import { Button, type ButtonAppearance, type ButtonSize, type ButtonVariant } from '../button';

import { UploadItemActionBase } from './base';
import { useUploadContext, useUploadItemContext } from './context';
import { canSaveUploadFile, fileName, formatFileLabel, saveUploadFile } from './helpers';
import type { UploadItemActionOwnProps, UploadItemActionProps } from './types';

type UploadItemActionResolvedProps = Omit<UploadItemActionOwnProps, 'classNames' | 'slotProps'> & {
  'as'?: ElementType;
  'children'?: ReactNode;
  'ref'?: Ref<HTMLButtonElement>;
  'href'?: string;
  'role'?: string;
  'disabled'?: boolean;
  'onClick'?: (event: MouseEvent<HTMLButtonElement>) => void;
  'aria-label'?: string;
};

// The two the part ships wired — an implementation detail rather than the shape
// of `action`, which takes any name, so the pair is named here and not in the
// public types. A name outside it — `'preview'`, `'retry'` — is a consumer's
// action: it still names itself through `data-action`, but the verb and the
// glyph come from the call site (`label` / `children`) and the behavior from
// `onClick`, exactly as a nameless one does. The built-in verbs come from the
// root's `downloadLabel` / `removeLabel`, so they localize with the rest of the
// copy.
const ACTION_ICON: Record<'download' | 'remove', ReactNode> = {
  download: <ArrowDownloadIconOutlinedRounded aria-hidden="true" focusable="false" />,
  remove: <CloseIconOutlinedRounded aria-hidden="true" focusable="false" />,
};

const isBuiltInAction = (action: string | undefined): action is 'download' | 'remove' => action === 'download' || action === 'remove';

// The row's action shape: a small, quiet icon button beside the file's details.
// Defaults rather than constants at the call to Button, so a theme or a call site
// can re-point them (a text-only remove, a danger-coloured one).
const DEFAULT_ACTION_APPEARANCE: ButtonAppearance = 'outlined';
const DEFAULT_ACTION_VARIANT: ButtonVariant = 'neutral';
const DEFAULT_ACTION_SIZE: ButtonSize = 'small';

export const UploadItemAction = <T extends ElementType = 'button'>(props: UploadItemActionProps<T>) => {
  const theme = useComponentTheme('UploadItemAction');
  const { disabled, readOnly, removeFile, downloadLabel, removeLabel } = useUploadContext('Upload.ItemAction');
  const { item } = useUploadItemContext('Upload.ItemAction');

  const { rootAttrs, rest } = composeRootAttrs(UploadItemActionBase, props as UploadItemActionProps<'button'>, theme, {
    // Which action this is: documented for consumers styling one action out of a
    // row. The look itself comes from Button's variant, not from this hook.
    stateAttrs: merged => ({ 'data-action': (merged as UploadItemActionResolvedProps).action }),
  });
  // Compose `slotProps.root`'s onClick rather than letting the explicit
  // `onClick` below (spread last) silently drop it — the Trigger/Submit rule.
  const { onClick: slotOnClick, ...actionRootAttrs } = rootAttrs as typeof rootAttrs & {
    onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  };
  const {
    as,
    action,
    label,
    children,
    ref,
    href,
    role,
    onClick,
    'disabled': ownDisabled,
    'aria-label': ariaLabel,
    // An icon button in the row: the anatomy and the look come from Button, so
    // the appearance knobs live here rather than in the Upload recipe. Applied
    // at the destructure site (the coding-standards rule) rather than pinned
    // after the spread, so they layer as defaults — a theme's
    // `UploadItemAction.defaultProps` is already merged into `rest` by
    // `composeRootAttrs`, and a value pinned after the spread would silently
    // outrank it.
    'appearance': appearance = DEFAULT_ACTION_APPEARANCE,
    'variant': variant = DEFAULT_ACTION_VARIANT,
    'size': size = DEFAULT_ACTION_SIZE,
    ...buttonProps
  } = rest as UploadItemActionResolvedProps;

  // The root's state is the floor, not the whole story: a consumer freezing one
  // action out of a row (a retry with nothing to retry yet) must not be undone
  // by an enabled root — the Trigger/Submit rule.
  const isDisabled = disabled || ownDisabled === true;

  // Remove is the one action a view mode takes away: read-only keeps the files
  // and every read action (download, preview) working, and drops the remove
  // affordance entirely rather than leaving a dead button. `disabled` is not
  // that — it freezes the control without changing the anatomy's shape.
  if (action === 'remove' && readOnly) return null;

  const isButton = (as ?? 'button') === 'button';
  // Only the link form has somewhere to put an `href` — on the default button it
  // is not rendered at all, so it cannot be what makes the action real or what
  // the built-in save steps aside for. Treating it as either would leave exactly
  // the dead control the guard below exists to prevent.
  const hasHref = !isButton && href !== undefined;

  // The same rule in the other direction: a download with nothing to hand the
  // browser is the dead button that guard exists to avoid. An `href` means the
  // platform is doing it, and a consumer's own `onClick` may resolve the source
  // late — either makes the action real, so only a bare built-in save on an
  // entry with neither `file` nor `url` drops out.
  if (action === 'download' && !canSaveUploadFile(item) && !hasHref && !onClick && !slotOnClick) return null;

  // The accessible name is a `{name}` template, not a verb glued to the file:
  // the call site's `label` and the root's copy are the same shape, so an
  // override never changes how the name is assembled — only what it says. An
  // empty one is a missing one rather than a silent button: on a built-in the
  // root's copy takes over (itself guaranteed non-empty), and a consumer's own
  // action falls through to `aria-label`, which is the only way left to name it.
  const nameTemplate = label || (action === 'download' ? downloadLabel : action === 'remove' ? removeLabel : undefined);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    // Rendered as anything but a button, the platform does not block the click
    // itself, so disabled is enforced here too.
    if (isDisabled) return;
    onClick?.(event);
    slotOnClick?.(event);
    // The built-in behavior runs after the consumer's handler, unless they
    // cancelled it. An `href` means the platform is already doing the download
    // (the `as="a"` form), so the built-in save stays out of its way.
    if (event.defaultPrevented) return;
    if (action === 'remove') removeFile(item.id);
    else if (action === 'download' && !hasHref) saveUploadFile(item);
  };

  // Spar's Button already marks a disabled non-button (`aria-disabled`,
  // `tabindex="-1"`, `data-disabled`) but leaves its `href` navigable, so the
  // link form drops the target while disabled.
  const renderedHref = isDisabled ? undefined : href;

  // Spar's Button also pins `role="button"` on whatever non-button element it
  // renders, which would announce a download link as a button — so the native
  // role is restored for the anchor form (a Spar-side fix would remove this).
  // Only while an `href` is actually being rendered, though: an `<a>` with none
  // — a consumer's own `onClick` action, or one whose target the disabled branch
  // above has just stripped — cannot navigate, and announcing a link that does
  // nothing is worse than letting Spar's `button` stand.
  //
  // A consumer's `role` outranks both, on either form: the button form drops out
  // of the anchor branch entirely, and `role` reaching Button only through it is
  // what silently lost a `role="menuitem"` on a row action inside a menu.
  const resolvedRole = role ?? (!isButton && as === 'a' && renderedHref !== undefined ? 'link' : undefined);
  // Absent rather than `undefined` when there is nothing to say: Spar keys its
  // own `role="button"` off whether the key is *present*, so passing an explicit
  // `undefined` would leave an `as="div"` action with no role at all.
  const roleProps = resolvedRole !== undefined ? { role: resolvedRole } : undefined;

  return (
    <Button
      {...buttonProps}
      {...(isButton ? null : { href: renderedHref })}
      {...roleProps}
      {...actionRootAttrs}
      as={as}
      appearance={appearance}
      variant={variant}
      size={size}
      disabled={isDisabled}
      // Icon-only actions still need a name, and it is per file: the template
      // comes from `action` / `label`, the file fills its `{name}`. An explicit
      // `aria-label` wins.
      aria-label={ariaLabel ?? (nameTemplate ? formatFileLabel(nameTemplate, fileName(item)) : undefined)}
      onClick={handleClick}
      // `startContent` (not children) keeps Button's icon-only anatomy — it is
      // what emits `data-icon-only` and sizes the glyph. Tested with
      // `isRenderableNode` rather than `??`, like every other content slot in the
      // anatomy: a `{showIcon && <X/>}` child that collapses to `false` is a
      // child the call site did not pass, and Button would drop it — leaving a
      // focusable, labelled button with nothing in it at all.
      startContent={isRenderableNode(children) ? children : isBuiltInAction(action) ? ACTION_ICON[action] : null}
      ref={ref}
    />
  );
};

UploadItemAction.displayName = 'Upload.ItemAction';

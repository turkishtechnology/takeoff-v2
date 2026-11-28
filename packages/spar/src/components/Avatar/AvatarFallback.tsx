import { useEffect, useState, type ElementType } from 'react';
import { useAvatarContext } from './hooks';
import type { AvatarFallbackProps } from './types';

/**
 * Content shown while the avatar's image is absent, loading or broken —
 * typically initials or an icon. Optionally waits `delayMs` before rendering.
 */
export const AvatarFallback = <T extends ElementType = 'span'>({ as, delayMs, children, ref, ...props }: AvatarFallbackProps<T>) => {
  const Component = as || 'span';
  const { imageLoadingStatus } = useAvatarContext();
  const [delayElapsed, setDelayElapsed] = useState(delayMs === undefined);

  useEffect(() => {
    if (delayMs === undefined) return undefined;
    const timer = window.setTimeout(() => setDelayElapsed(true), delayMs);
    return () => window.clearTimeout(timer);
  }, [delayMs]);

  if (!delayElapsed || imageLoadingStatus === 'loaded') return null;

  return (
    <Component ref={ref} {...props}>
      {children}
    </Component>
  );
};

AvatarFallback.displayName = 'AvatarFallback';

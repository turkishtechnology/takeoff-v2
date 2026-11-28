import { useMemo, useState, type ElementType } from 'react';
import { AvatarContext } from './hooks';
import type { AvatarImageLoadingStatus, AvatarProps } from './types';

/**
 * Headless avatar root. Owns the loading status of its `AvatarImage` so
 * `AvatarFallback` can show while the image is missing, loading or broken.
 */
export const Avatar = <T extends ElementType = 'span'>({ as, children, ref, ...props }: AvatarProps<T>) => {
  const Component = as || 'span';
  const [imageLoadingStatus, setImageLoadingStatus] = useState<AvatarImageLoadingStatus>('idle');

  const contextValue = useMemo(() => ({ imageLoadingStatus, setImageLoadingStatus }), [imageLoadingStatus]);

  return (
    <AvatarContext.Provider value={contextValue}>
      <Component ref={ref} {...props} data-status={imageLoadingStatus}>
        {children}
      </Component>
    </AvatarContext.Provider>
  );
};

Avatar.displayName = 'Avatar';

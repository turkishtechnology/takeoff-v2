import { useEffect, useRef, type ElementType } from 'react';
import { useAvatarContext, useImageLoadingStatus } from './hooks';
import type { AvatarImageProps } from './types';

/**
 * The avatar's picture. Mounts the `<img>` only after it has loaded, so a
 * broken image never shows; until then `AvatarFallback` renders instead.
 */
export const AvatarImage = <T extends ElementType = 'img'>({ as, onLoadingStatusChange, ref, ...props }: AvatarImageProps<T>) => {
  const Component = as || 'img';
  const { setImageLoadingStatus } = useAvatarContext();
  const { src, srcSet, sizes, crossOrigin, referrerPolicy } = props as AvatarImageProps<'img'>;
  const status = useImageLoadingStatus({ src, srcSet, sizes, crossOrigin, referrerPolicy });

  // Keep the latest callback without re-running the effect when it changes identity.
  const onChangeRef = useRef(onLoadingStatusChange);
  useEffect(() => {
    onChangeRef.current = onLoadingStatusChange;
  });

  useEffect(() => {
    setImageLoadingStatus(status);
    if (status !== 'idle') onChangeRef.current?.(status);
  }, [status, setImageLoadingStatus]);

  // An unmounted image no longer stands in for the fallback.
  useEffect(() => () => setImageLoadingStatus('idle'), [setImageLoadingStatus]);

  if (status !== 'loaded') return null;

  return <Component ref={ref} {...props} />;
};

AvatarImage.displayName = 'AvatarImage';

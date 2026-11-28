import { useEffect, useState, type ImgHTMLAttributes } from 'react';
import type { AvatarImageLoadingStatus } from '../types';

interface ImageSource {
  src?: string | undefined;
  srcSet?: string | undefined;
  sizes?: string | undefined;
  crossOrigin?: ImgHTMLAttributes<HTMLImageElement>['crossOrigin'];
  referrerPolicy?: ImgHTMLAttributes<HTMLImageElement>['referrerPolicy'];
}

/**
 * Preloads an image off-DOM and reports its loading status. Starts `idle` so
 * server and client render the same markup; an empty `src` is an `error`.
 */
export const useImageLoadingStatus = ({ src, srcSet, sizes, crossOrigin, referrerPolicy }: ImageSource): AvatarImageLoadingStatus => {
  const [status, setStatus] = useState<AvatarImageLoadingStatus>('idle');

  useEffect(() => {
    if (!src && !srcSet) {
      setStatus('error');
      return undefined;
    }

    let active = true;
    const image = new window.Image();
    const settle = (next: AvatarImageLoadingStatus) => () => {
      if (active) setStatus(next);
    };

    image.onload = settle('loaded');
    image.onerror = settle('error');
    if (crossOrigin !== undefined) image.crossOrigin = crossOrigin;
    if (referrerPolicy) image.referrerPolicy = referrerPolicy;
    if (sizes) image.sizes = sizes;
    if (srcSet) image.srcset = srcSet;
    if (src) image.src = src;

    // A cached image may already be decoded; skip the loading state then.
    setStatus(image.complete && image.naturalWidth > 0 ? 'loaded' : 'loading');

    return () => {
      active = false;
      image.onload = null;
      image.onerror = null;
    };
  }, [src, srcSet, sizes, crossOrigin, referrerPolicy]);

  return status;
};

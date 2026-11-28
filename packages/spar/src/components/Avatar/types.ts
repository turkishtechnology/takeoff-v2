import type { ElementType } from 'react';
import type { PolymorphicProps } from '../../types';

/**
 * Where an avatar image is in its lifecycle.
 * - `idle` — no `AvatarImage` has started loading (the initial state, also on the server)
 * - `loading` — the image is being fetched
 * - `loaded` — the image decoded and is shown
 * - `error` — the image failed, or `src` is empty
 */
export type AvatarImageLoadingStatus = 'idle' | 'loading' | 'loaded' | 'error';

/**
 * Value shared by the Avatar parts.
 */
export interface AvatarContextValue {
  /** Current loading status of the avatar's image. */
  imageLoadingStatus: AvatarImageLoadingStatus;
  /** Reports a new status; called by `AvatarImage`. */
  setImageLoadingStatus: (status: AvatarImageLoadingStatus) => void;
}

/**
 * Own props for the Avatar root.
 */
// Intentionally empty for now: the root owns the loading status, not visual props.
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface AvatarOwnProps {}

/**
 * Own props for AvatarImage.
 */
export interface AvatarImageOwnProps {
  /**
   * Called whenever the image's loading status changes (never with `idle`).
   */
  onLoadingStatusChange?: (status: AvatarImageLoadingStatus) => void;
}

/**
 * Own props for AvatarFallback.
 */
export interface AvatarFallbackOwnProps {
  /**
   * Waits this many milliseconds before rendering, so a fast-loading image
   * does not flash the fallback first. Without it the fallback renders at once.
   */
  delayMs?: number;
}

/**
 * Props for the Avatar root. Renders a `<span>` by default and emits
 * `data-status` with the image loading status.
 */
export type AvatarProps<T extends ElementType = 'span'> = PolymorphicProps<'span', T, AvatarOwnProps>;

/**
 * Props for AvatarImage. Renders an `<img>` only once the image has loaded.
 */
export type AvatarImageProps<T extends ElementType = 'img'> = PolymorphicProps<'img', T, AvatarImageOwnProps>;

/**
 * Props for AvatarFallback. Renders while the image is not loaded.
 */
export type AvatarFallbackProps<T extends ElementType = 'span'> = PolymorphicProps<'span', T, AvatarFallbackOwnProps>;

import { useEffect } from 'react';

/**
 * Marketing-surface hook: flags the page with `data-runway-landing="true"` on
 * <html> for the lifetime of the component.
 *
 * Color-mode is NOT forced here — the page respects the user's choice
 * (light / dark / system) so the landing adapts via the Takeoff design-token
 * values aliased inside `runway.css`. The flag is read by CSS to apply
 * landing-surface-specific treatments (backgrounds, section spacing, hero
 * grid overlays) without leaking into docs pages.
 */
export function useRunwaySurface(): void {
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-runway-landing', 'true');
    return () => {
      root.removeAttribute('data-runway-landing');
    };
  }, []);
}

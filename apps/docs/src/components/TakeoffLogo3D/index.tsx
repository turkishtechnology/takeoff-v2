import { Suspense, lazy, useEffect, useState, type JSX } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import LogoFallback from './LogoFallback';
import styles from './TakeoffLogo3D.module.css';

const TakeoffLogoCanvas = lazy(() => import('./Canvas'));

export interface TakeoffLogo3DProps {
  /** Wireframe color. Defaults to the cardinal-red contrast-shifted variant. */
  color?: string;
  /** Y-axis rotation speed in rad/s. */
  rotationSpeed?: number;
  /** SVG extrusion depth. */
  depth?: number;
  /** Render an additive-blend ghost pass for a subtle glow. */
  glow?: boolean;
  /** Render the static SVG fallback even when motion is allowed. */
  forceStatic?: boolean;
  /** Optional className on the root container. */
  className?: string;
  /** Optional inline style on the root container. */
  style?: React.CSSProperties;
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = (): void => setReduced(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return reduced;
}

/**
 * Rotating 3D extruded Takeoff logomark rendered via three.js.
 * — SSR safe (BrowserOnly)
 * — Reduced-motion safe (falls back to a static SVG)
 * — Lazy (the three.js bundle only ships when this component hydrates)
 */
export default function TakeoffLogo3D({ color, rotationSpeed, depth, glow, forceStatic, className, style }: TakeoffLogo3DProps): JSX.Element {
  const reducedMotion = usePrefersReducedMotion();
  const showStatic = forceStatic || reducedMotion;

  return (
    <div className={[styles.root, className].filter(Boolean).join(' ')} style={style}>
      {showStatic ? (
        <LogoFallback />
      ) : (
        <BrowserOnly fallback={<LogoFallback />}>
          {() => (
            <Suspense fallback={<LogoFallback />}>
              <TakeoffLogoCanvas color={color} rotationSpeed={rotationSpeed} depth={depth} glow={glow} />
            </Suspense>
          )}
        </BrowserOnly>
      )}
    </div>
  );
}

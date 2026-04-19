import { useMemo, useState, type JSX } from 'react';
import Link from '@docusaurus/Link';
import styles from './ThemingTeaser.module.css';

type Density = 'compact' | 'comfy' | 'loose';

const DENSITY_MAP: Record<Density, { padding: string; gap: string }> = {
  compact: { padding: '0.5rem', gap: '0.625rem' },
  comfy: { padding: '0.625rem', gap: '1rem' },
  loose: { padding: '0.875rem', gap: '1.25rem' },
};

function hslToHex(h: number, s: number, l: number): string {
  const a = (s / 100) * Math.min(l / 100, 1 - l / 100);
  const f = (n: number): string => {
    const k = (n + h / 30) % 12;
    const color = l / 100 - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

export default function ThemingTeaser(): JSX.Element {
  const [hue, setHue] = useState(352); // cardinal red default (≈ 352° H)
  const [radius, setRadius] = useState(8);
  const [density, setDensity] = useState<Density>('comfy');

  const primary = useMemo(() => hslToHex(hue, 92, 39), [hue]);
  const primaryGlow = useMemo(() => `hsla(${hue}, 92%, 39%, 0.25)`, [hue]);
  const { padding, gap } = DENSITY_MAP[density];

  const previewStyle = {
    '--tt-primary': primary,
    '--tt-primary-glow': primaryGlow,
    '--tt-preview-radius': `${radius}px`,
    '--tt-preview-padding': padding,
    '--tt-preview-gap': gap,
  } as React.CSSProperties;

  return (
    <section className={styles.section} aria-labelledby="runway-theming-title">
      <div className={styles.inner}>
        <div className={styles.copy}>
          <span className={styles.eyebrow}>Theming</span>
          <h2 id="runway-theming-title" className={styles.title}>
            Swap the brand in 10 seconds. Without forking a single component.
          </h2>
          <p className={styles.lede}>
            Every visual property routes through <code>@takeoff-design/tokens</code> as CSS custom properties. Change three variables — primary hue, radius, density — and the whole
            library follows. The components themselves never change.
          </p>
          <Link to="/theme-studio" className={styles.studioLink}>
            Open the Theme Studio →
          </Link>
        </div>

        <div className={styles.panel}>
          <div className={styles.controls}>
            <div className={styles.control}>
              <div className={styles.controlHead}>
                <span className={styles.controlName}>--primary hue</span>
                <span className={styles.controlValue}>{hue}°</span>
              </div>
              <input type="range" min={0} max={360} value={hue} onChange={e => setHue(Number(e.target.value))} className={styles.slider} aria-label="Primary hue" />
            </div>

            <div className={styles.control}>
              <div className={styles.controlHead}>
                <span className={styles.controlName}>--radius</span>
                <span className={styles.controlValue}>{radius}px</span>
              </div>
              <input type="range" min={0} max={24} value={radius} onChange={e => setRadius(Number(e.target.value))} className={styles.slider} aria-label="Corner radius" />
            </div>

            <div className={styles.control}>
              <div className={styles.controlHead}>
                <span className={styles.controlName}>density</span>
                <span className={styles.controlValue}>{density}</span>
              </div>
              <div className={styles.segmented} role="radiogroup" aria-label="Density">
                {(['compact', 'comfy', 'loose'] as Density[]).map(opt => (
                  <button key={opt} type="button" className={styles.segmentedOption} aria-pressed={density === opt} onClick={() => setDensity(opt)}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.preview} style={previewStyle}>
            <span className={styles.previewLabel}>Live preview</span>
            <input className={styles.previewInput} type="text" defaultValue="passenger@example.com" aria-label="Email" />
            <label className={styles.previewCheck}>
              <span className={styles.previewCheckBox} />
              Remember me on this device
            </label>
            <button type="button" className={styles.previewBtn}>
              Continue →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

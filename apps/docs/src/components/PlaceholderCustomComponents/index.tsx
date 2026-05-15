import type { JSX } from 'react';
import styles from './PlaceholderCustomComponents.module.css';

/*
 * ─────────────────────────────────────────────────────────────────────────
 * PlaceholderCustomComponents
 * ─────────────────────────────────────────────────────────────────────────
 *
 * Mock visuals used by the docs landing to stand in for components that have
 * NOT yet shipped in `@takeoff-ui/react-spar`. Each export mimics the visual
 * contract its real counterpart will eventually honour.
 *
 * TODO(react-spar): Replace each export here with the real primitive as it
 * ships. Currently outstanding:
 *
 *   - <Progress>    — Phase C candidate
 *   - <AvatarGroup> — Phase C candidate
 * ─────────────────────────────────────────────────────────────────────────
 */

/* ----- Progress ------------------------------------------------------- */

export interface PlaceholderProgressProps {
  label: string;
  value: string;
  pulse?: boolean;
}

export function PlaceholderProgress({ label, value, pulse = false }: PlaceholderProgressProps): JSX.Element {
  return (
    <>
      <div className={styles.progressLabel}>
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className={styles.progressBar}>
        <div className={`${styles.progressFill} ${pulse ? '' : styles.progressFillFull}`} />
      </div>
    </>
  );
}

/* ----- AvatarGroup ---------------------------------------------------- */

export interface PlaceholderAvatarGroupProps {
  initials: string[];
}

export function PlaceholderAvatarGroup({ initials }: PlaceholderAvatarGroupProps): JSX.Element {
  return (
    <div className={styles.avatars}>
      {initials.map(i => (
        <span key={i} className={styles.avatar}>
          {i}
        </span>
      ))}
    </div>
  );
}

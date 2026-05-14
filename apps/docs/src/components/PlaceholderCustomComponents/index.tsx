import type { JSX } from 'react';
import styles from './PlaceholderCustomComponents.module.css';

/*
 * ─────────────────────────────────────────────────────────────────────────
 * PlaceholderCustomComponents
 * ─────────────────────────────────────────────────────────────────────────
 *
 * This file is the single source of truth for every ad-hoc mock visual the
 * docs landing uses to stand in for components that have NOT yet shipped in
 * `@takeoff-ui/react-spar`. Each export here is a thin, purely-presentational
 * component that mimics the visual contract its real counterpart will
 * eventually honour (same slot names, same semantic color roles, same
 * compound shape).
 *
 * ─────────────────────────────────────────────────────────────────────────
 * TODO(react-spar): Replace every export in this file with the real compound
 * primitive from `@takeoff-ui/react-spar` as it ships. Tracking:
 *
 *   - <Button>      — Not yet shipped from react-spar; will replace PlaceholderButton
 *   - <Input>       — In progress; will replace PlaceholderInput
 *   - <Badge>       — Phase C candidate
 *   - <Switch>      — Will replace PlaceholderSwitch
 *   - <Progress>    — Phase C candidate
 *   - <AvatarGroup> — Phase C candidate
 *
 * When a component ships, delete its export below and replace imports in
 * ComponentGrid.tsx (and anywhere else this file is referenced) with the
 * real one.
 * ─────────────────────────────────────────────────────────────────────────
 */

/* ----- Button --------------------------------------------------------- */

export type PlaceholderButtonVariant = 'primary' | 'neutral';
export type PlaceholderButtonType = 'filled' | 'outlined' | 'text';
export type PlaceholderButtonSize = 'small' | 'default' | 'large';

export interface PlaceholderButtonProps {
  variant?: PlaceholderButtonVariant;
  type?: PlaceholderButtonType;
  size?: PlaceholderButtonSize;
  children: React.ReactNode;
}

const BTN_VARIANT_CLASS: Record<PlaceholderButtonVariant, string> = {
  primary: styles.btnPrimary,
  neutral: styles.btnNeutral,
};

const BTN_TYPE_CLASS: Record<PlaceholderButtonType, string> = {
  filled: styles.btnFilled,
  outlined: styles.btnOutlined,
  text: styles.btnText,
};

const BTN_SIZE_CLASS: Record<PlaceholderButtonSize, string> = {
  small: styles.btnSmall,
  default: styles.btnDefault,
  large: styles.btnLarge,
};

export function PlaceholderButton({ variant = 'primary', type = 'filled', size = 'default', children }: PlaceholderButtonProps): JSX.Element {
  return (
    <button type="button" className={`${styles.btn} ${BTN_VARIANT_CLASS[variant]} ${BTN_TYPE_CLASS[type]} ${BTN_SIZE_CLASS[size]}`}>
      {children}
    </button>
  );
}

/* ----- Input ---------------------------------------------------------- */

export interface PlaceholderInputProps {
  label: string;
  value: string;
}

export function PlaceholderInput({ label, value }: PlaceholderInputProps): JSX.Element {
  return (
    <div className={styles.input}>
      <span className={styles.inputLabel}>{label}</span>
      <div className={styles.inputContainer}>
        <span className={styles.inputField}>{value}</span>
      </div>
    </div>
  );
}

/* ----- Badge ---------------------------------------------------------- */

export type BadgeVariant = 'info' | 'ok' | 'warn' | 'err';

export interface PlaceholderBadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
}

const BADGE_VARIANT_CLASS: Record<BadgeVariant, string> = {
  info: styles.badgeInfo,
  ok: styles.badgeOk,
  warn: styles.badgeWarn,
  err: styles.badgeErr,
};

export function PlaceholderBadge({ variant, children }: PlaceholderBadgeProps): JSX.Element {
  return (
    <span className={`${styles.badge} ${BADGE_VARIANT_CLASS[variant]}`}>
      <span className={styles.dot} />
      {children}
    </span>
  );
}

/* ----- Switch --------------------------------------------------------- */

export interface PlaceholderSwitchProps {
  checked: boolean;
  label: string;
}

export function PlaceholderSwitchRow({ checked, label }: PlaceholderSwitchProps): JSX.Element {
  return (
    <div className={styles.toggleRow}>
      <span>{label}</span>
      <span className={`${styles.toggle} ${checked ? styles.toggleOn : ''}`} role="switch" aria-checked={checked} />
    </div>
  );
}

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

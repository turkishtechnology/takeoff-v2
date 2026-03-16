import clsx from 'clsx';

import styles from './ApiBadge.module.css';

type BadgeVariant = 'primary' | 'secondary' | 'neutral' | 'info' | 'success' | 'danger' | 'warning' | 'verified' | 'purple' | 'cyan' | 'business' | 'teal';

type BadgeSize = 'small' | 'base' | 'large';
type BadgeType = 'filled' | 'filledlight' | 'outlined' | 'text';

export interface ApiBadgeProps {
  className?: string;
  label: string;
  rounded?: boolean;
  size?: BadgeSize;
  type?: BadgeType;
  variant?: BadgeVariant;
}

export function ApiBadge({ className, label, rounded = false, size = 'large', type = 'filledlight', variant = 'primary' }: ApiBadgeProps) {
  return (
    <span className={clsx(styles.badge, styles[variant], styles[type], styles[size], rounded && styles.rounded, className)}>
      <span className={styles.label}>{label}</span>
    </span>
  );
}

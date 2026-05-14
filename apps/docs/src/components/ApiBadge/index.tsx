import { Badge, type BadgeAppearance, type BadgeSize, type BadgeVariant } from '@takeoff-ui/react-spar';

type ApiBadgeType = 'filled' | 'filledlight' | 'outlined' | 'text';

const TYPE_TO_APPEARANCE: Record<ApiBadgeType, BadgeAppearance> = {
  filled: 'filled',
  filledlight: 'filledLight',
  outlined: 'outlined',
  text: 'text',
};

export interface ApiBadgeProps {
  className?: string;
  label: string;
  rounded?: boolean;
  size?: BadgeSize;
  type?: ApiBadgeType;
  variant?: BadgeVariant;
}

export function ApiBadge({ className, label, rounded = false, size = 'large', type = 'filledlight', variant = 'primary' }: ApiBadgeProps) {
  return (
    <Badge className={className} rounded={rounded} size={size} appearance={TYPE_TO_APPEARANCE[type]} variant={variant}>
      {label}
    </Badge>
  );
}

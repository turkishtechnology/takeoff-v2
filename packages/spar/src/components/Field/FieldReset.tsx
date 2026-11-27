import type { ReactNode } from 'react';
import { FieldContext } from './hooks';

export interface FieldResetProps {
  children?: ReactNode;
}

/**
 * Ends the surrounding `Field` scope for its subtree: every control inside
 * reads `useOptionalFieldContext()` as `null`, exactly as if no Field were
 * present.
 *
 * For composite controls whose own sub-controls must not adopt the Field's
 * wiring — a color picker's hue slider and channel inputs would otherwise all
 * take the Field label as their name and the field id as their `id`. The
 * composite reads the Field once, at its root, and passes on only the state it
 * wants (disabled, read-only) as explicit props.
 */
export const FieldReset = ({ children }: FieldResetProps) => <FieldContext.Provider value={null}>{children}</FieldContext.Provider>;

FieldReset.displayName = 'FieldReset';

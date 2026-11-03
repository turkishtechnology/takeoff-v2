import { useEffect, useRef, useState, type KeyboardEvent, type MouseEvent, type PointerEvent } from 'react';
import type { Column } from '@tanstack/react-table';

import { useTableContext } from './context';
import { RESIZE_KEYBOARD_STEP, RESIZE_KEYBOARD_STEP_LARGE } from './defaults';
import { clampColumnWidth, getColumnResizeBounds } from './helpers';
import type { TableColumnSizing } from './types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyColumn = Column<any, unknown>;

interface DragSession {
  pointerId: number;
  startX: number;
  startWidth: number;
  base: TableColumnSizing;
  /** `-1` in RTL, where dragging toward the inline end means moving left. */
  direction: 1 | -1;
  moved: boolean;
}

const readDirection = (element: HTMLElement): 1 | -1 => (getComputedStyle(element).direction === 'rtl' ? -1 : 1);

/**
 * The drag/keyboard affordance on a header cell's inline-end edge. A focusable
 * `role="separator"` (the WAI-ARIA window-splitter pattern): pointer drag —
 * mouse, pen, and touch through pointer capture — or Left/Right arrows resize
 * the column, Shift takes a larger step, and a double-click returns the column
 * to its declared `width`.
 *
 * The handle never commits mid-drag: it renders a draft through context and
 * commits once on release, so `columnResizing.onChange` fires per resize.
 */
export const TableResizeHandle = ({ column }: { column: AnyColumn }) => {
  const { slotAttrs, columnResizing } = useTableContext('Table.ResizeHandle');
  const sessionRef = useRef<DragSession | null>(null);
  const [dragging, setDragging] = useState(false);
  const setDraftRef = useRef(columnResizing?.setDraft);
  setDraftRef.current = columnResizing?.setDraft;

  // Abandon an in-flight drag without committing. The draft lives in Table
  // state, so a drag that never sees its pointerup (window blur, capture taken
  // away, the handle unmounting mid-drag) must clear it here or the column
  // stays stuck at the draft width.
  const abandon = () => {
    if (!sessionRef.current) return;
    sessionRef.current = null;
    setDragging(false);
    setDraftRef.current?.(null);
  };
  const abandonRef = useRef(abandon);
  abandonRef.current = abandon;

  useEffect(() => {
    if (!dragging) return;
    const onBlur = () => abandonRef.current();
    window.addEventListener('blur', onBlur);
    return () => window.removeEventListener('blur', onBlur);
  }, [dragging]);

  useEffect(() => () => abandonRef.current(), []);

  if (!columnResizing) return null;

  const [min, max] = getColumnResizeBounds(column);
  const header = column.columnDef.header;
  const label = typeof header === 'string' ? `Resize ${header} column` : 'Resize column';
  const attrs = slotAttrs('resizeHandle');

  const widthAt = (session: DragSession, clientX: number) => clampColumnWidth(column, session.startWidth + (clientX - session.startX) * session.direction);

  const handlePointerDown = (event: PointerEvent<HTMLElement>) => {
    attrs.onPointerDown?.(event);
    if (event.defaultPrevented || event.button !== 0) return;
    // Keep the press from selecting header text or reaching the cell.
    event.preventDefault();
    event.stopPropagation();

    const base = columnResizing.getBaseSizing();
    const startWidth = base[column.id] ?? column.getSize();
    sessionRef.current = { pointerId: event.pointerId, startX: event.clientX, startWidth, base, direction: readDirection(event.currentTarget), moved: false };
    event.currentTarget.setPointerCapture?.(event.pointerId);
    setDragging(true);
  };

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    attrs.onPointerMove?.(event);
    const session = sessionRef.current;
    if (!session || event.pointerId !== session.pointerId) return;
    session.moved = true;
    columnResizing.setDraft({ base: session.base, columnId: column.id, width: widthAt(session, event.clientX) });
  };

  const endSession = (event: PointerEvent<HTMLElement>, commit: boolean) => {
    const session = sessionRef.current;
    if (!session || event.pointerId !== session.pointerId) return;
    sessionRef.current = null;
    setDragging(false);
    columnResizing.setDraft(null);
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    // A press without movement is a click (or half of a double-click): it must
    // not freeze the auto layout.
    if (!commit || !session.moved) return;
    const width = widthAt(session, event.clientX);
    if (width !== session.startWidth) columnResizing.commit({ ...session.base, [column.id]: width });
  };

  const handlePointerUp = (event: PointerEvent<HTMLElement>) => {
    attrs.onPointerUp?.(event);
    endSession(event, true);
  };

  const handlePointerCancel = (event: PointerEvent<HTMLElement>) => {
    attrs.onPointerCancel?.(event);
    endSession(event, false);
  };

  // Fires after a normal pointerup too, but the session is already closed by
  // then; reaching here with a live session means the capture was taken away.
  const handleLostPointerCapture = (event: PointerEvent<HTMLElement>) => {
    attrs.onLostPointerCapture?.(event);
    if (sessionRef.current?.pointerId === event.pointerId) abandon();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    attrs.onKeyDown?.(event);
    if (event.defaultPrevented || (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight')) return;
    event.preventDefault();
    const step = event.shiftKey ? RESIZE_KEYBOARD_STEP_LARGE : RESIZE_KEYBOARD_STEP;
    const sign = (event.key === 'ArrowRight' ? 1 : -1) * readDirection(event.currentTarget);
    const base = columnResizing.getBaseSizing();
    const current = base[column.id] ?? column.getSize();
    const width = clampColumnWidth(column, current + sign * step);
    if (width !== current) columnResizing.commit({ ...base, [column.id]: width });
  };

  const handleDoubleClick = (event: MouseEvent<HTMLElement>) => {
    attrs.onDoubleClick?.(event);
    if (event.defaultPrevented) return;
    columnResizing.reset(column.id);
  };

  return (
    <div
      {...attrs}
      role="separator"
      aria-orientation="vertical"
      aria-label={attrs['aria-label'] ?? label}
      aria-valuenow={Math.round(column.getSize())}
      aria-valuemin={min}
      aria-valuemax={Number.isFinite(max) ? max : undefined}
      tabIndex={0}
      data-resizing={dragging ? '' : undefined}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onLostPointerCapture={handleLostPointerCapture}
      onKeyDown={handleKeyDown}
      onDoubleClick={handleDoubleClick}
    />
  );
};

TableResizeHandle.displayName = 'Table.ResizeHandle';

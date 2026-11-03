import { useEffect, useRef, useState, type KeyboardEvent, type MouseEvent, type PointerEvent } from 'react';
import type { Column } from '@tanstack/react-table';

import { useTableContext, type TableGrowPlan } from './context';
import { RESIZE_DRAG_THRESHOLD, RESIZE_KEYBOARD_STEP, RESIZE_KEYBOARD_STEP_LARGE } from './defaults';
import { clampColumnWidth, getColumnResizeBounds, resolveGrowth, type ResolvedGrowth } from './helpers';
import type { TableColumnSizing } from './types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyColumn = Column<any, unknown>;

interface DragSession {
  pointerId: number;
  startX: number;
  startWidth: number;
  /**
   * Where growing takes room from. Measured on the first move that grows the
   * column, so a click or a shrinking drag never measures.
   */
  plan?: TableGrowPlan;
  /** The width last drawn for the column during this drag. */
  liveWidth: number;
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
 * to its declared `width` (or fits it to its content when it declares none).
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

  // The header cell's rendered width, so assistive tech hears the width on
  // screen — before the first resize `getSize()` is only the 150px default.
  const handleRef = useRef<HTMLDivElement>(null);
  const [renderedWidth, setRenderedWidth] = useState<number>();
  // The table's width stands in for the upper bound of a column without a
  // `maxWidth` (ARIA would otherwise assume 100).
  const [tableWidth, setTableWidth] = useState<number>();
  useEffect(() => {
    const cell = handleRef.current?.parentElement;
    if (!cell || typeof ResizeObserver === 'undefined') return;
    const tableElement = cell.closest('table');
    const observer = new ResizeObserver(() => {
      setRenderedWidth(Math.ceil(cell.getBoundingClientRect().width));
      if (tableElement) setTableWidth(Math.floor(tableElement.getBoundingClientRect().width));
    });
    observer.observe(cell);
    if (tableElement) observer.observe(tableElement);
    return () => observer.disconnect();
  }, []);

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
  // Clamped so it never sits outside the range announced next to it (the auto
  // layout ignores the bounds until the first resize).
  const now = Math.min(max, Math.max(min, renderedWidth || Math.round(column.getSize())));
  const valueMax = Number.isFinite(max) ? max : tableWidth ? Math.max(now, tableWidth) : undefined;

  // A growing column takes its room from the absorber and then from the
  // columns after it, so the table never grows past its container.
  const widthAt = (session: DragSession, clientX: number): ResolvedGrowth => {
    const desired = clampColumnWidth(column, session.startWidth + (clientX - session.startX) * session.direction);
    if (desired <= session.startWidth) return { width: desired };
    session.plan ??= columnResizing.getGrowPlan(column.id, session.base, session.startWidth - session.liveWidth);
    return resolveGrowth(session.startWidth, desired, session.plan);
  };

  const handlePointerDown = (event: PointerEvent<HTMLElement>) => {
    attrs.onPointerDown?.(event);
    if (event.defaultPrevented || event.button !== 0) return;
    // Keep the press from selecting header text or reaching the cell.
    event.preventDefault();
    event.stopPropagation();

    const base = columnResizing.getBaseSizing();
    const startWidth = base[column.id] ?? column.getSize();
    sessionRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startWidth,
      liveWidth: startWidth,
      base,
      direction: readDirection(event.currentTarget),
      moved: false,
    };
    event.currentTarget.setPointerCapture?.(event.pointerId);
    setDragging(true);
  };

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    attrs.onPointerMove?.(event);
    const session = sessionRef.current;
    if (!session || event.pointerId !== session.pointerId) return;
    if (!session.moved && Math.abs(event.clientX - session.startX) < RESIZE_DRAG_THRESHOLD) return;
    session.moved = true;
    const resolved = widthAt(session, event.clientX);
    session.liveWidth = resolved.width;
    columnResizing.setDraft({ base: session.base, columnId: column.id, ...resolved });
  };

  const endSession = (event: PointerEvent<HTMLElement>, commit: boolean) => {
    const session = sessionRef.current;
    if (!session || event.pointerId !== session.pointerId) return;
    sessionRef.current = null;
    // Resolve while the last drawn draft is still on screen (the plan, if not
    // measured yet, reads the absorber's rendered width).
    const resolved = commit && session.moved ? widthAt(session, event.clientX) : undefined;
    setDragging(false);
    columnResizing.setDraft(null);
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    // A press without movement is a click (or half of a double-click): it must
    // not freeze the auto layout.
    if (!resolved) return;
    if (resolved.width !== session.startWidth) columnResizing.commit({ ...session.base, ...resolved.donors, [column.id]: resolved.width });
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
    const stepped = clampColumnWidth(column, current + sign * step);
    const { width, donors } = stepped > current ? resolveGrowth(current, stepped, columnResizing.getGrowPlan(column.id, base)) : { width: stepped, donors: undefined };
    if (width !== current) columnResizing.commit({ ...base, ...donors, [column.id]: width });
  };

  const handleDoubleClick = (event: MouseEvent<HTMLElement>) => {
    attrs.onDoubleClick?.(event);
    if (event.defaultPrevented) return;
    columnResizing.reset(column.id);
  };

  return (
    <div
      {...attrs}
      ref={handleRef}
      role="separator"
      aria-orientation="vertical"
      aria-label={attrs['aria-label'] ?? label}
      aria-valuenow={now}
      aria-valuemin={min}
      aria-valuemax={valueMax}
      aria-valuetext={`${now} px`}
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

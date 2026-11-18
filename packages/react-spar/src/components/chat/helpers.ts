import type { KeyboardEvent } from 'react';

import { buildSlotAttrs, type ClassNamesMap, type ComponentBase, type SlotPropsMap } from '../../core';
import { fileName } from '../upload/helpers';

import { GROUP_GAP_MS } from './defaults';
import type { ChatLabels, ChatMessage, ChatParticipant, ChatReply, ChatTimestamp } from './types';

export const toTime = (value: ChatTimestamp): number => (value instanceof Date ? value.getTime() : new Date(value).getTime());

const dayKey = (time: number): string => {
  const date = new Date(time);
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
};

export const isSameDay = (a: number, b: number): boolean => dayKey(a) === dayKey(b);

export const formatTime = (time: number, locale: string | undefined): string => new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: '2-digit' }).format(time);

/** "Today", "Yesterday", or the date — with the year only when it is not the current one. */
export const formatDay = (time: number, now: number, locale: string | undefined, labels: Pick<ChatLabels, 'today' | 'yesterday'>): string => {
  if (isSameDay(time, now)) return labels.today;
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (isSameDay(time, yesterday.getTime())) return labels.yesterday;
  const sameYear = new Date(time).getFullYear() === new Date(now).getFullYear();
  return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: sameYear ? undefined : 'numeric' }).format(time);
};

/** The time shown in a conversation list: the clock for today, the date otherwise. */
export const formatListTime = (time: number, now: number, locale: string | undefined, labels: Pick<ChatLabels, 'today' | 'yesterday'>): string =>
  isSameDay(time, now) ? formatTime(time, locale) : formatDay(time, now, locale, labels);

/** Whether `message` continues the group started by `previous`: same sender, same day, a short gap. */
export const continuesGroup = (previous: ChatMessage | undefined, message: ChatMessage): boolean => {
  if (!previous || previous.senderId !== message.senderId) return false;
  const a = toTime(previous.createdAt);
  const b = toTime(message.createdAt);
  return isSameDay(a, b) && b - a < GROUP_GAP_MS;
};

/** Up to two initials, for an avatar without a picture. */
export const initials = (name: string): string =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part.charAt(0).toLocaleUpperCase())
    .join('');

/** Whether `now` is still inside the window that opened at `createdAt`. No window means no limit. */
export const isWithinWindow = (message: ChatMessage, windowMs: number | undefined, now: number): boolean => windowMs === undefined || now < toTime(message.createdAt) + windowMs;

/**
 * The next moment one of `messages` leaves its edit or delete window, so the
 * root can re-render then and take the action away. `undefined` when nothing
 * is pending.
 */
export const nextWindowClose = (messages: ChatMessage[], windows: (number | undefined)[], now: number): number | undefined => {
  let next: number | undefined;
  for (const message of messages) {
    for (const windowMs of windows) {
      if (windowMs === undefined) continue;
      const closes = toTime(message.createdAt) + windowMs;
      if (closes > now && (next === undefined || closes < next)) next = closes;
    }
  }
  return next;
};

/** Joins names the way the locale lists them ("A, B and C"), where the platform can. */
// `Intl.ListFormat` is ES2021; the package compiles against an older lib.
type ListFormatConstructor = new (locale: string | undefined, options: { type: 'conjunction' }) => { format: (items: string[]) => string };

export const listNames = (names: string[], locale: string | undefined): string => {
  const ListFormat = (Intl as unknown as { ListFormat?: ListFormatConstructor }).ListFormat;
  return ListFormat ? new ListFormat(locale, { type: 'conjunction' }).format(names) : names.join(', ');
};

/**
 * Whether a keydown belongs to an open IME composition (Japanese, Korean, …),
 * whose Enter confirms a candidate rather than sending. Safari reports those
 * with `keyCode` 229 instead of `isComposing`.
 */
export const isComposing = (event: KeyboardEvent): boolean => event.nativeEvent.isComposing || event.keyCode === 229;

interface SlotLayers<TSlot extends string> {
  slotProps?: SlotPropsMap<TSlot>;
  classNames?: ClassNamesMap<TSlot>;
}

/** Attrs for a part's non-root slot: canonical class + `data-slot`, then theme and instance overrides. */
export const slotAttrsFor =
  <TSlot extends string>(base: Pick<ComponentBase<unknown, TSlot>, 'getSlotProps'>, theme: SlotLayers<TSlot> | undefined, props: SlotLayers<TSlot>) =>
  (slot: TSlot) =>
    buildSlotAttrs(base.getSlotProps(slot), slot, {
      themeSlotProps: theme?.slotProps,
      themeClassNames: theme?.classNames,
      instanceSlotProps: props.slotProps,
      instanceClassNames: props.classNames,
    });

/**
 * Who and what a quote shows. The loaded original wins, so an edit or a delete
 * shows in every quote of it; the reply's own copy covers an original that is
 * not loaded.
 */
export const describeQuote = (
  reply: ChatReply,
  original: ChatMessage | undefined,
  { labels, participants, currentUserId }: { labels: ChatLabels; participants: Map<string, ChatParticipant>; currentUserId: string },
): { author: string; text: string } => {
  const senderId = original?.senderId ?? reply.senderId;
  const author = senderId === undefined ? '' : senderId === currentUserId ? labels.you : (participants.get(senderId)?.name ?? senderId);
  if (!original) return { author, text: reply.text || labels.originalMessage };
  if (original.deleted) return { author, text: labels.deleted };
  const firstFile = original.attachments?.[0];
  return { author, text: original.text || (firstFile ? fileName(firstFile) : labels.originalMessage) };
};

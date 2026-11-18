import type { HTMLAttributes, ReactNode } from 'react';

import { initials } from './helpers';

interface ChatAvatarProps extends HTMLAttributes<HTMLSpanElement> {
  name: string;
  avatar?: string | ReactNode;
}

/**
 * Internal: a participant's or conversation's picture, or their initials.
 * Decorative — the name is always said next to it — so it is hidden from
 * assistive technology.
 */
export const ChatAvatar = ({ name, avatar, ...attrs }: ChatAvatarProps) => (
  <span {...attrs} aria-hidden="true">
    {typeof avatar === 'string' ? <img src={avatar} alt="" /> : (avatar ?? initials(name))}
  </span>
);

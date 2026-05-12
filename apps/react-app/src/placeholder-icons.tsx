// TODO(takeoff-icons): These inline SVGs mirror Material Symbols icons used by
// takeoff-ui (flight, luggage, task_alt, mail, search). They are temporary
// Lucide-sourced (MIT) placeholders. Replace with the official Takeoff icon
// set before the first public release.
import type { SVGProps } from 'react';

const baseSvgProps: SVGProps<SVGSVGElement> = {
  'xmlns': 'http://www.w3.org/2000/svg',
  'width': '1em',
  'height': '1em',
  'viewBox': '0 0 24 24',
  'fill': 'none',
  'stroke': 'currentColor',
  'strokeWidth': 2,
  'strokeLinecap': 'round',
  'strokeLinejoin': 'round',
  'focusable': false,
  'aria-hidden': true,
};

export const FlightIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...baseSvgProps} data-placeholder-icon="flight" {...props}>
    <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
  </svg>
);

export const LuggageIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...baseSvgProps} data-placeholder-icon="luggage" {...props}>
    <rect width="16" height="15" x="4" y="6" rx="2" />
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <path d="M10 6v12" />
    <path d="M14 6v12" />
    <circle cx="8" cy="21" r="1" />
    <circle cx="16" cy="21" r="1" />
  </svg>
);

// Material `task_alt` → Lucide `CircleCheck`.
export const TaskAltIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...baseSvgProps} data-placeholder-icon="task-alt" {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

export const MailIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...baseSvgProps} data-placeholder-icon="mail" {...props}>
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

export const SearchIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...baseSvgProps} data-placeholder-icon="search" {...props}>
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

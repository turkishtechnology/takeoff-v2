// TODO(takeoff-icons): These inline SVGs mirror Material Symbols icons used by
// takeoff-ui (flight, luggage, hotel, search, mail, sell, add, remove,
// arrow_forward, close). They are temporary Lucide-sourced (MIT) placeholders
// used in the docs examples. Replace every usage with the official Takeoff
// icon set before the first public release.
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

// Material `flight` → Lucide `Plane`.
export const FlightIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...baseSvgProps} data-placeholder-icon="flight" {...props}>
    <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
  </svg>
);

// Material `luggage` → Lucide `Luggage`.
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

// Material `hotel` → Lucide `BedDouble`.
export const HotelIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...baseSvgProps} data-placeholder-icon="hotel" {...props}>
    <path d="M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8" />
    <path d="M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4" />
    <path d="M12 4v6" />
    <path d="M2 18h20" />
  </svg>
);

// Material `search` → Lucide `Search`.
export const SearchIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...baseSvgProps} data-placeholder-icon="search" {...props}>
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

// Material `mail` → Lucide `Mail`.
export const MailIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...baseSvgProps} data-placeholder-icon="mail" {...props}>
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

// Material `sell` → Lucide `Tag`.
export const SellIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...baseSvgProps} data-placeholder-icon="sell" {...props}>
    <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
    <circle cx="7.5" cy="7.5" r=".5" fill="currentColor" />
  </svg>
);

// Material `add` → Lucide `Plus`.
export const AddIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...baseSvgProps} data-placeholder-icon="add" {...props}>
    <path d="M5 12h14" />
    <path d="M12 5v14" />
  </svg>
);

// Material `remove` → Lucide `Minus`.
export const RemoveIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...baseSvgProps} data-placeholder-icon="remove" {...props}>
    <path d="M5 12h14" />
  </svg>
);

// Material `arrow_forward` → Lucide `ArrowRight`.
export const ArrowForwardIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...baseSvgProps} data-placeholder-icon="arrow-forward" {...props}>
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

// Material `close` → Lucide `X`.
export const CloseIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...baseSvgProps} data-placeholder-icon="close" {...props}>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

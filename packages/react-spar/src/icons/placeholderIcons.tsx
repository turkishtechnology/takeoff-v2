// TODO(takeoff-icons): These inline SVGs are temporary placeholders sourced
// from Lucide (MIT). Replace every usage with the official Takeoff icon set
// before the first public release of @takeoff-ui/react-spar.
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

export const PlaceholderChevronDown = (props: SVGProps<SVGSVGElement>) => (
  <svg {...baseSvgProps} data-placeholder-icon="chevron-down" {...props}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export const PlaceholderChevronUp = (props: SVGProps<SVGSVGElement>) => (
  <svg {...baseSvgProps} data-placeholder-icon="chevron-up" {...props}>
    <path d="m18 15-6-6-6 6" />
  </svg>
);

export const PlaceholderClose = (props: SVGProps<SVGSVGElement>) => (
  <svg {...baseSvgProps} data-placeholder-icon="close" {...props}>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

export const PlaceholderInfo = (props: SVGProps<SVGSVGElement>) => (
  <svg {...baseSvgProps} data-placeholder-icon="info" {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4" />
    <path d="M12 8h.01" />
  </svg>
);

export const PlaceholderSuccess = (props: SVGProps<SVGSVGElement>) => (
  <svg {...baseSvgProps} data-placeholder-icon="success" {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

export const PlaceholderWarning = (props: SVGProps<SVGSVGElement>) => (
  <svg {...baseSvgProps} data-placeholder-icon="warning" {...props}>
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </svg>
);

export const PlaceholderError = (props: SVGProps<SVGSVGElement>) => (
  <svg {...baseSvgProps} data-placeholder-icon="error" {...props}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" x2="12" y1="8" y2="12" />
    <line x1="12" x2="12.01" y1="16" y2="16" />
  </svg>
);

export const PlaceholderCheck = (props: SVGProps<SVGSVGElement>) => (
  <svg {...baseSvgProps} data-placeholder-icon="check" {...props}>
    <path d="M5 12l5 5L20 7" />
  </svg>
);

export const PlaceholderRemove = (props: SVGProps<SVGSVGElement>) => (
  <svg {...baseSvgProps} data-placeholder-icon="remove" {...props}>
    <path d="M5 12h14" />
  </svg>
);

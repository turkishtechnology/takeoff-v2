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

// Filled Material-Symbols-style icons. These mirror the Takeoff Design System's
// glyphs (lock / visibility / visibility_off / info), exported from Figma and
// re-centred on a 24×24 grid via a per-icon transform so they share the same
// optical box as the stroked Lucide placeholders above.
const filledSvgProps: SVGProps<SVGSVGElement> = {
  'xmlns': 'http://www.w3.org/2000/svg',
  'width': '1em',
  'height': '1em',
  'viewBox': '0 0 24 24',
  'fill': 'currentColor',
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

export const PlaceholderChevronLeft = (props: SVGProps<SVGSVGElement>) => (
  <svg {...baseSvgProps} data-placeholder-icon="chevron-left" {...props}>
    <path d="m15 18-6-6 6-6" />
  </svg>
);

export const PlaceholderChevronRight = (props: SVGProps<SVGSVGElement>) => (
  <svg {...baseSvgProps} data-placeholder-icon="chevron-right" {...props}>
    <path d="m9 18 6-6-6-6" />
  </svg>
);

// Double chevrons — first/last page controls.
export const PlaceholderChevronsLeft = (props: SVGProps<SVGSVGElement>) => (
  <svg {...baseSvgProps} data-placeholder-icon="chevrons-left" {...props}>
    <path d="m11 17-5-5 5-5" />
    <path d="m18 17-5-5 5-5" />
  </svg>
);

export const PlaceholderChevronsRight = (props: SVGProps<SVGSVGElement>) => (
  <svg {...baseSvgProps} data-placeholder-icon="chevrons-right" {...props}>
    <path d="m6 17 5-5-5-5" />
    <path d="m13 17 5-5-5-5" />
  </svg>
);

// Up-down chevron — the neutral "sortable but unsorted" affordance.
export const PlaceholderChevronsUpDown = (props: SVGProps<SVGSVGElement>) => (
  <svg {...baseSvgProps} data-placeholder-icon="chevrons-up-down" {...props}>
    <path d="m7 15 5 5 5-5" />
    <path d="m7 9 5-5 5 5" />
  </svg>
);

export const PlaceholderClose = (props: SVGProps<SVGSVGElement>) => (
  <svg {...baseSvgProps} data-placeholder-icon="close" {...props}>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

export const PlaceholderInfo = (props: SVGProps<SVGSVGElement>) => (
  <svg {...filledSvgProps} data-placeholder-icon="info" {...props}>
    <g transform="translate(2 2) scale(1.714)">
      <path d="M5.83333 0C2.61333 0 0 2.61333 0 5.83333C0 9.05333 2.61333 11.6667 5.83333 11.6667C9.05333 11.6667 11.6667 9.05333 11.6667 5.83333C11.6667 2.61333 9.05333 0 5.83333 0ZM5.83333 8.75C5.5125 8.75 5.25 8.4875 5.25 8.16667V5.83333C5.25 5.5125 5.5125 5.25 5.83333 5.25C6.15417 5.25 6.41667 5.5125 6.41667 5.83333V8.16667C6.41667 8.4875 6.15417 8.75 5.83333 8.75ZM6.41667 4.08333H5.25V2.91667H6.41667V4.08333Z" />
    </g>
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
  <svg {...filledSvgProps} data-placeholder-icon="error" {...props}>
    <g transform="translate(2 2) scale(1.714)" fillRule="evenodd" clipRule="evenodd">
      <path d="M5.83333 0C2.61333 0 0 2.61333 0 5.83333C0 9.05333 2.61333 11.6667 5.83333 11.6667C9.05333 11.6667 11.6667 9.05333 11.6667 5.83333C11.6667 2.61333 9.05333 0 5.83333 0ZM5.83333 2.91667C6.15417 2.91667 6.41667 3.17917 6.41667 3.5V5.83333C6.41667 6.15417 6.15417 6.41667 5.83333 6.41667C5.5125 6.41667 5.25 6.15417 5.25 5.83333V3.5C5.25 3.17917 5.5125 2.91667 5.83333 2.91667ZM5.25 7.58333H6.41667V8.75H5.25V7.58333Z" />
    </g>
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

export const PlaceholderAdd = (props: SVGProps<SVGSVGElement>) => (
  <svg {...baseSvgProps} data-placeholder-icon="add" {...props}>
    <path d="M5 12h14M12 5v14" />
  </svg>
);

export const PlaceholderLock = (props: SVGProps<SVGSVGElement>) => (
  <svg {...filledSvgProps} data-placeholder-icon="lock" {...props}>
    <g transform="translate(4 1.5) scale(1.2)" fillRule="evenodd" clipRule="evenodd">
      <path d="M11.6667 5.83333H10.8333V4.16667C10.8333 1.86667 8.96667 0 6.66667 0C4.36667 0 2.5 1.86667 2.5 4.16667V5.83333H1.66667C0.75 5.83333 0 6.58333 0 7.5V15.8333C0 16.75 0.75 17.5 1.66667 17.5H11.6667C12.5833 17.5 13.3333 16.75 13.3333 15.8333V7.5C13.3333 6.58333 12.5833 5.83333 11.6667 5.83333ZM4.16667 4.16667C4.16667 2.78333 5.28333 1.66667 6.66667 1.66667C8.05 1.66667 9.16667 2.78333 9.16667 4.16667V5.83333H4.16667V4.16667ZM11.6667 15.8333H1.66667V7.5H11.6667V15.8333ZM6.66667 13.3333C7.58333 13.3333 8.33333 12.5833 8.33333 11.6667C8.33333 10.75 7.58333 10 6.66667 10C5.75 10 5 10.75 5 11.6667C5 12.5833 5.75 13.3333 6.66667 13.3333Z" />
    </g>
  </svg>
);

export const PlaceholderEye = (props: SVGProps<SVGSVGElement>) => (
  <svg {...filledSvgProps} data-placeholder-icon="eye" {...props}>
    <g transform="translate(1 4.5) scale(1.2)" fillRule="evenodd" clipRule="evenodd">
      <path d="M9.16667 1.66667C12.325 1.66667 15.1417 3.44167 16.5167 6.25C15.1417 9.05833 12.325 10.8333 9.16667 10.8333C6.00833 10.8333 3.19167 9.05833 1.81667 6.25C3.19167 3.44167 6.00833 1.66667 9.16667 1.66667ZM9.16667 0C5 0 1.44167 2.59167 0 6.25C1.44167 9.90833 5 12.5 9.16667 12.5C13.3333 12.5 16.8917 9.90833 18.3333 6.25C16.8917 2.59167 13.3333 0 9.16667 0ZM9.16667 4.16667C10.3167 4.16667 11.25 5.1 11.25 6.25C11.25 7.4 10.3167 8.33333 9.16667 8.33333C8.01667 8.33333 7.08333 7.4 7.08333 6.25C7.08333 5.1 8.01667 4.16667 9.16667 4.16667ZM9.16667 2.5C7.1 2.5 5.41667 4.18333 5.41667 6.25C5.41667 8.31667 7.1 10 9.16667 10C11.2333 10 12.9167 8.31667 12.9167 6.25C12.9167 4.18333 11.2333 2.5 9.16667 2.5Z" />
    </g>
  </svg>
);

export const PlaceholderEyeOff = (props: SVGProps<SVGSVGElement>) => (
  <svg {...filledSvgProps} data-placeholder-icon="eye-off" {...props}>
    <g transform="translate(1 2.42) scale(1.2)" fillRule="evenodd" clipRule="evenodd">
      <path d="M9.16667 2.95833C12.325 2.95833 15.1417 4.73333 16.5167 7.54167C16.025 8.55833 15.3333 9.43333 14.5083 10.1417L15.6833 11.3167C16.8417 10.2917 17.7583 9.00833 18.3333 7.54167C16.8917 3.88333 13.3333 1.29167 9.16667 1.29167C8.10833 1.29167 7.09167 1.45833 6.13333 1.76667L7.50833 3.14167C8.05 3.03333 8.6 2.95833 9.16667 2.95833ZM8.275 3.90833L10 5.63333C10.475 5.84167 10.8583 6.225 11.0667 6.7L12.7917 8.425C12.8583 8.14167 12.9083 7.84167 12.9083 7.53333C12.9167 5.46667 11.2333 3.79167 9.16667 3.79167C8.85833 3.79167 8.56667 3.83333 8.275 3.90833ZM0.841667 1.18333L3.075 3.41667C1.71667 4.48333 0.641667 5.9 0 7.54167C1.44167 11.2 5 13.7917 9.16667 13.7917C10.4333 13.7917 11.65 13.55 12.7667 13.1083L15.6167 15.9583L16.7917 14.7833L2.01667 0L0.841667 1.18333ZM7.09167 7.43333L9.26667 9.60833C9.23333 9.61667 9.2 9.625 9.16667 9.625C8.01667 9.625 7.08333 8.69167 7.08333 7.54167C7.08333 7.5 7.09167 7.475 7.09167 7.43333ZM4.25833 4.6L5.71667 6.05833C5.525 6.51667 5.41667 7.01667 5.41667 7.54167C5.41667 9.60833 7.1 11.2917 9.16667 11.2917C9.69167 11.2917 10.1917 11.1833 10.6417 10.9917L11.4583 11.8083C10.725 12.0083 9.95833 12.125 9.16667 12.125C6.00833 12.125 3.19167 10.35 1.81667 7.54167C2.4 6.35 3.25 5.36667 4.25833 4.6Z" />
    </g>
  </svg>
);

import type { SVGAttributes } from 'react';

/** Internal: the default person glyph shown when the fallback has no children. */
export const AvatarIcon = (attrs: SVGAttributes<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 52" fill="currentColor" aria-hidden="true" focusable="false" {...attrs}>
    <circle cx="32.3068" cy="12.0212" r="12.0212" />
    <path d="M64 54.0952C64 46.9218 60.6286 40.0421 54.6274 34.9697C48.6263 29.8973 40.4869 27.0476 32 27.0476C23.5131 27.0476 15.3737 29.8973 9.37259 34.9697C3.37142 40.0421 1.28149e-06 46.9217 0 54.0952L32 54.0952H64Z" />
  </svg>
);

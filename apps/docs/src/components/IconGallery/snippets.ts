import { reactExportName } from './reactExportName';

/**
 * Per-icon, per-variant code snippets for every distribution of
 * `@takeoff-icons`. The gallery's detail dialog renders one block per format so
 * a user can copy the import + usage for whichever package they consume.
 *
 * Each builder takes the kebab icon `name` and a `variant` string of the form
 * `<style>/<type>` (e.g. `outlined/rounded`) and returns ready-to-paste code.
 * Keep the shapes in sync with the prose in `apps/docs/icons/usage/*.mdx`.
 */
export type IconFormatId = 'react' | 'font' | 'sprite' | 'wc' | 'svg';

export interface IconFormat {
  id: IconFormatId;
  /** Tab / heading label shown in the dialog. */
  label: string;
  /** Highlight language for the rendered code block. */
  language: 'tsx' | 'ts' | 'html';
  /** Install line for the package, shown once above the snippet. */
  install: string;
  /** The copy-able import + usage snippet for this icon + variant. */
  code: string;
}

const DEFAULT_VARIANT = 'outlined/rounded';

function splitVariant(variant: string): [string, string] {
  const [style, type] = variant.split('/');
  return [style ?? 'outlined', type ?? 'rounded'];
}

/** `add` -> `<i class="ti ti-add">` modifiers for a non-default variant. */
function fontClasses(name: string, style: string, type: string): string {
  const classes = ['ti'];
  classes.push(style === 'filled' ? `ti-${name}-filled` : `ti-${name}`);
  if (type !== 'rounded') classes.push(`ti-${type}`);
  return classes.join(' ');
}

function reactSnippet(name: string, variant: string): string {
  const exportName = reactExportName(name, variant);
  return `import { ${exportName} } from '@takeoff-icons/react/${name}';

export function Example() {
  return <${exportName} />;
}`;
}

function fontSnippet(name: string, style: string, type: string): string {
  return `import '@takeoff-icons/font';

<i class="${fontClasses(name, style, type)}"></i>`;
}

function spriteSnippet(name: string, style: string, type: string): string {
  const symbolId = `ti-${name}-${style}-${type}`;
  return `import spriteUrl from '@takeoff-icons/sprite';

<svg width="24" height="24">
  <use href={\`\${spriteUrl}#${symbolId}\`} />
</svg>`;
}

function wcSnippet(name: string, style: string, type: string): string {
  return `import '@takeoff-icons/wc';
import icon from '@takeoff-icons/core/icons/${style}/${type}/${name}';

const el = document.querySelector('takeoff-icon');
el.icon = icon;

// <takeoff-icon size="base" label="${name}"></takeoff-icon>`;
}

function svgSnippet(name: string, style: string, type: string): string {
  const path = `@takeoff-icons/svg/svg/${style}/${type}/${name}.svg`;
  return `import iconUrl from '${path}';

<img src={iconUrl} alt="${name}" width={24} height={24} />`;
}

/** Build the full set of format snippets for an icon + variant. */
export function buildIconFormats(name: string, variant: string = DEFAULT_VARIANT): IconFormat[] {
  const [style, type] = splitVariant(variant);
  return [
    {
      id: 'react',
      label: 'React',
      language: 'tsx',
      install: 'pnpm add @takeoff-icons/react',
      code: reactSnippet(name, variant),
    },
    {
      id: 'font',
      label: 'Icon font',
      language: 'html',
      install: 'pnpm add @takeoff-icons/font',
      code: fontSnippet(name, style, type),
    },
    {
      id: 'sprite',
      label: 'SVG sprite',
      language: 'html',
      install: 'pnpm add @takeoff-icons/sprite',
      code: spriteSnippet(name, style, type),
    },
    {
      id: 'wc',
      label: 'Web Component',
      language: 'ts',
      install: 'pnpm add @takeoff-icons/wc',
      code: wcSnippet(name, style, type),
    },
    {
      id: 'svg',
      label: 'Raw SVG',
      language: 'tsx',
      install: 'pnpm add @takeoff-icons/svg',
      code: svgSnippet(name, style, type),
    },
  ];
}

import { useCallback, useEffect, useMemo, useState } from 'react';
import useIsBrowser from '@docusaurus/useIsBrowser';
import useBaseUrl from '@docusaurus/useBaseUrl';
import clsx from 'clsx';

import { DEFAULT_VARIANT, iconCategories, iconEntries, type IconGalleryEntry, type IconVariantSvg } from '@site/src/data/icons.generated';
import { reactExportName } from './reactExportName';
import styles from './styles.module.css';

const STYLES = ['outlined', 'filled'] as const;
const TYPES = ['rounded', 'sharp', 'bevel', 'tk'] as const;

const [DEFAULT_STYLE, DEFAULT_TYPE] = DEFAULT_VARIANT.split('/') as [string, string];

/**
 * Lazily fetch a whole variant's SVG map. The default variant is inlined in the
 * data module; every other variant is ONE static JSON file under
 * `/icon-svg/<style>-<type>.json` (emitted by `gen:icons`) — a map of
 * `{ [iconName]: { viewBox, svg } }` — fetched once the first time the user
 * switches to that variant, then served from cache for every cell. We fetch a
 * static file rather than dynamically importing from `@takeoff-icons/core`
 * because the package's `exports` map blocks webpack's dynamic-import context
 * module. Each variant's fetch promise is memoized so concurrent cells share it.
 */
type VariantMap = Record<string, IconVariantSvg>;
const variantCache = new Map<string, Promise<VariantMap>>();

function loadVariantMap(baseUrl: string, variant: string): Promise<VariantMap> {
  const cached = variantCache.get(variant);
  if (cached) return cached;
  const fileName = `${variant.replace('/', '-')}.json`;
  const promise = fetch(`${baseUrl}${fileName}`)
    .then(res => (res.ok ? (res.json() as Promise<VariantMap>) : {}))
    .catch(() => ({}) as VariantMap);
  variantCache.set(variant, promise);
  return promise;
}

interface IconCellProps {
  entry: IconGalleryEntry;
  variant: string;
  svgBaseUrl: string;
  copied: boolean;
  onCopy: (entry: IconGalleryEntry, exportName: string) => void;
}

function IconCell({ entry, variant, svgBaseUrl, copied, onCopy }: IconCellProps) {
  // Default variant comes inlined; anything else is fetched and stored here.
  const isDefault = variant === DEFAULT_VARIANT;
  const [svg, setSvg] = useState<IconVariantSvg | null>(isDefault ? entry.defaultSvg : null);

  useEffect(() => {
    if (isDefault) {
      setSvg(entry.defaultSvg);
      return;
    }
    if (!entry.variants.includes(variant)) {
      setSvg(null);
      return;
    }
    let active = true;
    void loadVariantMap(svgBaseUrl, variant).then(map => {
      if (active) setSvg(map[entry.name] ?? null);
    });
    return () => {
      active = false;
    };
  }, [entry, variant, isDefault, svgBaseUrl]);

  const exportName = reactExportName(entry.name, variant);

  return (
    <button type="button" className={clsx(styles.cell, copied && styles.cellCopied)} onClick={() => onCopy(entry, exportName)} title={`${entry.name} — click to copy import`}>
      {svg ? (
        <svg className={styles.glyph} viewBox={svg.viewBox} width="1em" height="1em" role="img" aria-label={entry.name} dangerouslySetInnerHTML={{ __html: svg.svg }} />
      ) : (
        <span className={styles.glyphPlaceholder} aria-hidden="true" />
      )}
      <span className={styles.cellName}>{copied ? 'Copied!' : entry.name}</span>
    </button>
  );
}

export default function IconGallery() {
  const isBrowser = useIsBrowser();
  const svgBaseUrl = useBaseUrl('/icon-svg/');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [style, setStyle] = useState(DEFAULT_STYLE);
  const [type, setType] = useState(DEFAULT_TYPE);
  const [copiedName, setCopiedName] = useState<string | null>(null);

  const variant = `${style}/${type}`;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return iconEntries.filter(entry => {
      if (category !== 'all' && entry.category !== category) return false;
      if (q && !entry.searchText.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [query, category]);

  const handleCopy = useCallback(
    (entry: IconGalleryEntry, exportName: string) => {
      if (!isBrowser) return;
      const snippet = `import { ${exportName} } from '@takeoff-icons/react/${entry.name}';`;
      void navigator.clipboard?.writeText(snippet);
      setCopiedName(entry.name);
      window.setTimeout(() => setCopiedName(current => (current === entry.name ? null : current)), 1200);
    },
    [isBrowser],
  );

  return (
    <div className={styles.root}>
      <div className={styles.controls}>
        <input className={styles.search} type="search" placeholder="Search icons…" value={query} onChange={e => setQuery(e.target.value)} aria-label="Search icons" />

        <label className={styles.field}>
          <span className={styles.fieldLabel}>Category</span>
          <select className={styles.select} value={category} onChange={e => setCategory(e.target.value)}>
            <option value="all">All categories</option>
            {iconCategories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.label}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.field}>
          <span className={styles.fieldLabel}>Style</span>
          <select className={styles.select} value={style} onChange={e => setStyle(e.target.value)}>
            {STYLES.map(s => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.field}>
          <span className={styles.fieldLabel}>Type</span>
          <select className={styles.select} value={type} onChange={e => setType(e.target.value)}>
            {TYPES.map(t => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className={styles.count}>
        {filtered.length} {filtered.length === 1 ? 'icon' : 'icons'} · variant <code>{variant}</code>
      </p>

      {filtered.length === 0 ? (
        <p className={styles.empty}>No icons match your search.</p>
      ) : (
        <div className={styles.grid}>
          {filtered.map(entry => (
            <IconCell key={entry.name} entry={entry} variant={variant} svgBaseUrl={svgBaseUrl} copied={copiedName === entry.name} onCopy={handleCopy} />
          ))}
        </div>
      )}
    </div>
  );
}

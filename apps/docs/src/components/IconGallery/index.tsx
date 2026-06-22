import { useCallback, useMemo, useState } from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';

import { DEFAULT_VARIANT, iconCategories, iconEntries, type IconGalleryEntry } from '@site/src/data/icons.generated';
import { useVariantSvg } from './useVariantSvg';
import IconDetailDialog from './IconDetailDialog';
import styles from './styles.module.css';

const STYLES = ['outlined', 'filled'] as const;
const TYPES = ['rounded', 'sharp', 'bevel', 'tk'] as const;

const [DEFAULT_STYLE, DEFAULT_TYPE] = DEFAULT_VARIANT.split('/') as [string, string];

interface IconCellProps {
  entry: IconGalleryEntry;
  variant: string;
  svgBaseUrl: string;
  onOpen: (entry: IconGalleryEntry) => void;
}

function IconCell({ entry, variant, svgBaseUrl, onOpen }: IconCellProps) {
  const svg = useVariantSvg(entry, variant, svgBaseUrl);

  return (
    <button type="button" className={styles.cell} onClick={() => onOpen(entry)} title={`${entry.name} — click for usage`}>
      {svg ? (
        <svg className={styles.glyph} viewBox={svg.viewBox} width="1em" height="1em" role="img" aria-label={entry.name} dangerouslySetInnerHTML={{ __html: svg.svg }} />
      ) : (
        <span className={styles.glyphPlaceholder} aria-hidden="true" />
      )}
      <span className={styles.cellName}>{entry.name}</span>
    </button>
  );
}

/**
 * Resolves the preview SVG for the dialog's *current* variant (which the dialog
 * can change independently of the grid) and forwards it down. Kept as a thin
 * wrapper so the SVG-loading hook stays out of the dialog's own concerns.
 */
function DialogHost({ entry, galleryVariant, svgBaseUrl, onClose }: { entry: IconGalleryEntry; galleryVariant: string; svgBaseUrl: string; onClose: () => void }) {
  const [variant, setVariant] = useState(galleryVariant);
  const svg = useVariantSvg(entry, variant, svgBaseUrl);

  return <IconDetailDialog entry={entry} initialVariant={galleryVariant} svg={svg} onVariantChange={setVariant} onClose={onClose} />;
}

export default function IconGallery() {
  const svgBaseUrl = useBaseUrl('/icon-svg/');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [style, setStyle] = useState(DEFAULT_STYLE);
  const [type, setType] = useState(DEFAULT_TYPE);
  const [selected, setSelected] = useState<IconGalleryEntry | null>(null);

  const variant = `${style}/${type}`;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return iconEntries.filter(entry => {
      if (category !== 'all' && entry.category !== category) return false;
      if (q && !entry.searchText.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [query, category]);

  const handleOpen = useCallback((entry: IconGalleryEntry) => setSelected(entry), []);
  const handleClose = useCallback(() => setSelected(null), []);

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
            <IconCell key={entry.name} entry={entry} variant={variant} svgBaseUrl={svgBaseUrl} onOpen={handleOpen} />
          ))}
        </div>
      )}

      {selected ? <DialogHost entry={selected} galleryVariant={variant} svgBaseUrl={svgBaseUrl} onClose={handleClose} /> : null}
    </div>
  );
}

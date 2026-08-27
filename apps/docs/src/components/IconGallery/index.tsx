import { useCallback, useEffect, useMemo, useState } from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';

import { ReactSparDemoRoot } from '@site/src/components/ReactSparDocs';
import { DEFAULT_VARIANT, iconCategories, iconEntries, type IconGalleryEntry } from '@site/src/data/icons.generated';
import { DEFAULT_ICON_SIZE, ICON_TYPES, titleCase, type IconStyle } from './constants';
import GalleryHero from './GalleryHero';
import GalleryToolbar from './GalleryToolbar';
import IconDetailDrawer from './IconDetailDrawer';
import { useVariantSvg } from './useVariantSvg';
import styles from './styles.module.css';

const [DEFAULT_STYLE, DEFAULT_TYPE] = DEFAULT_VARIANT.split('/') as [IconStyle, string];

/** Bucket for entries whose category id is missing from `iconCategories`. */
const UNCATEGORIZED = { id: '__other', label: 'Other' };

interface IconCellProps {
  entry: IconGalleryEntry;
  variant: string;
  size: number;
  selected: boolean;
  svgBaseUrl: string;
  onOpen: (entry: IconGalleryEntry) => void;
}

function IconCell({ entry, variant, size, selected, svgBaseUrl, onOpen }: IconCellProps) {
  const svg = useVariantSvg(entry, variant, svgBaseUrl);

  return (
    <button type="button" className={styles.cell} data-selected={selected || undefined} aria-pressed={selected} onClick={() => onOpen(entry)} title={entry.name}>
      <span className={styles.glyphBox}>
        {svg ? (
          <svg className={styles.glyph} viewBox={svg.viewBox} width={size} height={size} role="img" aria-label={entry.name} dangerouslySetInnerHTML={{ __html: svg.svg }} />
        ) : (
          <span className={styles.glyphPlaceholder} style={{ width: size, height: size }} aria-hidden="true" />
        )}
      </span>
      <span className={styles.cellName}>{titleCase(entry.name)}</span>
    </button>
  );
}

/**
 * Resolves the preview SVG for the dialog's *current* variant (which the dialog
 * can change independently of the grid) and forwards it down. Kept as a thin
 * wrapper so the SVG-loading hook stays out of the dialog's own concerns.
 */
function DialogHost({
  entry,
  galleryVariant,
  color,
  onColorChange,
  svgBaseUrl,
  onClose,
}: {
  entry: IconGalleryEntry;
  galleryVariant: string;
  color: string | null;
  onColorChange: (value: string | null) => void;
  svgBaseUrl: string;
  onClose: () => void;
}) {
  const [detailEntry, setDetailEntry] = useState(entry);
  const [variant, setVariant] = useState(galleryVariant);
  const svg = useVariantSvg(detailEntry, variant, svgBaseUrl);

  useEffect(() => {
    setDetailEntry(entry);
    setVariant(galleryVariant);
  }, [entry, galleryVariant]);

  return (
    <IconDetailDrawer
      entry={detailEntry}
      initialVariant={galleryVariant}
      svg={svg}
      color={color}
      onColorChange={onColorChange}
      onEntryChange={setDetailEntry}
      onVariantChange={setVariant}
      onClose={onClose}
    />
  );
}

export default function IconGallery() {
  const svgBaseUrl = useBaseUrl('/icon-svg/');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [style, setStyle] = useState<IconStyle>(DEFAULT_STYLE);
  const [type, setType] = useState(DEFAULT_TYPE);
  const [size, setSize] = useState<number>(DEFAULT_ICON_SIZE);
  const [color, setColor] = useState<string | null>(null);
  const [selected, setSelected] = useState<IconGalleryEntry | null>(null);

  const variant = `${style}/${type}`;

  /** Every style x type rendition in the set — the hero's second headline number. */
  const variantCount = useMemo(() => iconEntries.reduce((total, entry) => total + entry.variants.length, 0), []);

  /**
   * Which types still have icons under the current category, query and style.
   * Same rule as the grid one level up: a type that would yield an empty page is
   * offered but not selectable, rather than letting the reader pick it and land
   * on "no icons match".
   */
  const availableTypes = useMemo(() => {
    const q = query.trim().toLowerCase();
    const inScope = iconEntries.filter(entry => {
      if (category !== 'all' && entry.category !== category) return false;
      if (q && !entry.searchText.toLowerCase().includes(q)) return false;
      return true;
    });
    return new Set(ICON_TYPES.filter(t => inScope.some(entry => entry.variants.includes(`${style}/${t.value}`))).map(t => t.value));
  }, [query, category, style]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return iconEntries.filter(entry => {
      // Coverage is not uniform — `outlined/tk` ships 1,047 of the 1,128, and a
      // handful of icons have no filled cut at all. An entry without the current
      // variant used to render as an empty tile, so drop it from the set
      // instead: the grid shows what the variant actually has.
      if (!entry.variants.includes(variant)) return false;
      if (category !== 'all' && entry.category !== category) return false;
      if (q && !entry.searchText.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [query, category, variant]);

  /**
   * The design lays the set out as titled category sections rather than one
   * undifferentiated wall of icons, so group the filtered entries and keep the
   * category order `iconCategories` already defines. An explicit category
   * filter collapses this to a single section, which is the same code path.
   */
  const groups = useMemo(() => {
    const byCategory = new Map<string, IconGalleryEntry[]>();
    for (const entry of filtered) {
      const key = entry.category || UNCATEGORIZED.id;
      const bucket = byCategory.get(key);
      if (bucket) bucket.push(entry);
      else byCategory.set(key, [entry]);
    }

    const ordered = iconCategories.filter(cat => byCategory.has(cat.id)).map(cat => ({ id: cat.id, label: cat.label, entries: byCategory.get(cat.id) as IconGalleryEntry[] }));

    // Anything whose category id is not in the metadata still has to render.
    for (const [key, entries] of byCategory) {
      if (iconCategories.some(cat => cat.id === key)) continue;
      ordered.push({ id: key, label: key === UNCATEGORIZED.id ? UNCATEGORIZED.label : titleCase(key), entries });
    }

    return ordered;
  }, [filtered]);

  const handleOpen = useCallback((entry: IconGalleryEntry) => setSelected(entry), []);
  const handleClose = useCallback(() => setSelected(null), []);

  return (
    <ReactSparDemoRoot>
      <div className={styles.root}>
        <GalleryHero totalCount={iconEntries.length} variantCount={variantCount} />

        <GalleryToolbar
          query={query}
          onQueryChange={setQuery}
          categories={iconCategories}
          category={category}
          onCategoryChange={setCategory}
          type={type}
          availableTypes={availableTypes}
          onTypeChange={setType}
          size={size}
          onSizeChange={setSize}
          color={color}
          onColorChange={setColor}
          style={style}
          onStyleChange={setStyle}
        />

        {filtered.length === 0 ? (
          <p className={styles.empty}>No icons match your search.</p>
        ) : (
          // One `color` declaration on the wrapper drives every glyph, since the
          // inlined SVGs paint with `currentColor`. `undefined` falls back to
          // the theme ink, which is what keeps the default legible in dark mode.
          <div className={styles.sections} style={{ color: color ?? undefined, ['--icon-preview' as string]: `${size}px` }}>
            {groups.map(group => (
              <section key={group.id} className={styles.section}>
                <h2 className={styles.sectionTitle}>{group.label}</h2>
                <div className={styles.grid}>
                  {group.entries.map(entry => (
                    <IconCell key={entry.name} entry={entry} variant={variant} size={size} selected={selected?.name === entry.name} svgBaseUrl={svgBaseUrl} onOpen={handleOpen} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        {selected ? <DialogHost entry={selected} galleryVariant={variant} color={color} onColorChange={setColor} svgBaseUrl={svgBaseUrl} onClose={handleClose} /> : null}
      </div>
    </ReactSparDemoRoot>
  );
}

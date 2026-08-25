import type { JSX } from 'react';

import { Button, Input, Select } from '@takeoff-ui/react-spar';
import { SearchIconOutlinedRounded } from '@takeoff-icons/react/search';
import type { IconGalleryCategory } from '@site/src/data/icons.generated';
import { ICON_SIZES, ICON_STYLES, ICON_TYPES, PLACEHOLDER_COLOR, type IconStyle } from './constants';
import styles from './styles.module.css';

/**
 * The gallery's filter bar: query and taxonomy filters that narrow *which* icons
 * show, then the render filters (size, colour, outlined/filled) that change
 * *how* they are drawn.
 *
 * One flat wrapping row, deliberately — no sub-groups. Grouping them meant the
 * bar had a seam, and every pixel it had spare piled up there rather than
 * spreading: 357px of hole between Type and Size at a 1920 viewport. Flat, the
 * controls keep one 16px rhythm and whatever no longer fits simply wraps to the
 * next line.
 */

interface GalleryToolbarProps {
  query: string;
  onQueryChange: (value: string) => void;
  categories: IconGalleryCategory[];
  category: string;
  onCategoryChange: (value: string) => void;
  type: string;
  onTypeChange: (value: string) => void;
  size: number;
  onSizeChange: (value: number) => void;
  /** `null` means "inherit the theme's ink colour" — the default state. */
  color: string | null;
  onColorChange: (value: string | null) => void;
  style: IconStyle;
  onStyleChange: (value: IconStyle) => void;
}

export default function GalleryToolbar({
  query,
  onQueryChange,
  categories,
  category,
  onCategoryChange,
  type,
  onTypeChange,
  size,
  onSizeChange,
  color,
  onColorChange,
  style,
  onStyleChange,
}: GalleryToolbarProps): JSX.Element {
  return (
    <div className={styles.toolbar}>
      <div className={styles.searchField}>
        <Input>
          <Input.Field type="search" placeholder="Search takeoff icons" value={query} onChange={e => onQueryChange(e.target.value)} aria-label="Search icons" />
          <Input.TrailingIcon>
            <SearchIconOutlinedRounded width={16} height={16} />
          </Input.TrailingIcon>
        </Input>
      </div>

      <label className={styles.field}>
        <span className={styles.fieldLabel}>Category</span>
        <Select value={category} onChange={onCategoryChange}>
          <Select.Trigger placeholder="All" />
          <Select.Content>
            <Select.Viewport>
              <Select.Item value="all" label="All">
                All
              </Select.Item>
              {categories.map(cat => (
                <Select.Item key={cat.id} value={cat.id} label={cat.label}>
                  {cat.label}
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select>
      </label>

      <label className={styles.field}>
        <span className={styles.fieldLabel}>Type</span>
        <Select value={type} onChange={onTypeChange}>
          <Select.Trigger placeholder="Type" />
          <Select.Content>
            <Select.Viewport>
              {ICON_TYPES.map(t => (
                <Select.Item key={t.value} value={t.value} label={t.label}>
                  {t.label}
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select>
      </label>

      <label className={`${styles.field} ${styles.fieldNarrow}`}>
        <span className={styles.fieldLabel}>Size</span>
        <Select value={String(size)} onChange={value => onSizeChange(Number(value))}>
          <Select.Trigger placeholder="Size" />
          <Select.Content>
            <Select.Viewport>
              {ICON_SIZES.map(s => (
                <Select.Item key={s} value={String(s)} label={`${s} px`}>
                  {s} px
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select>
      </label>

      <div className={styles.fieldColor}>
        <span className={styles.fieldLabel} id="icon-color-label">
          Color
        </span>
        <div className={styles.colorControl} data-placeholder={color === null || undefined}>
          <input className={styles.colorSwatch} type="color" value={color ?? PLACEHOLDER_COLOR} onChange={e => onColorChange(e.target.value)} aria-labelledby="icon-color-label" />
          <span className={styles.colorValue}>{(color ?? PLACEHOLDER_COLOR).toUpperCase()}</span>
          {color === null ? null : (
            <button type="button" className={styles.colorReset} onClick={() => onColorChange(null)} aria-label="Reset icon colour">
              ×
            </button>
          )}
        </div>
      </div>

      <div className={styles.fieldAuto}>
        <span className={styles.fieldLabel} id="icon-style-label">
          Icon style
        </span>
        <div className={styles.segmented} role="radiogroup" aria-labelledby="icon-style-label">
          {ICON_STYLES.map(s => (
            <Button
              key={s.value}
              role="radio"
              aria-checked={style === s.value}
              variant={style === s.value ? 'primary' : 'neutral'}
              appearance={style === s.value ? 'filled' : 'text'}
              onClick={() => onStyleChange(s.value)}
              className={styles.segment}
            >
              {s.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

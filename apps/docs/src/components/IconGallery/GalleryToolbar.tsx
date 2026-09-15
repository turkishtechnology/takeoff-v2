import { useEffect, useState, type JSX } from 'react';

import { Button, Field, Input, Select } from '@takeoff-ui/react-spar';
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
  /** Types that still have icons under the current category, query and style. */
  availableTypes: Set<string>;
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
  availableTypes,
  onTypeChange,
  size,
  onSizeChange,
  color,
  onColorChange,
  style,
  onStyleChange,
}: GalleryToolbarProps): JSX.Element {
  /* The box needs a draft of its own: committing only complete hex values means
     an empty `color` would otherwise reset the field on the very first
     keystroke, so `#` could never be typed. Empty commits `null` — no override,
     glyphs fall back to the theme ink. */
  const [colorDraft, setColorDraft] = useState(color ?? '');
  useEffect(() => setColorDraft(color ?? ''), [color]);

  return (
    <div className={styles.toolbar}>
      <Field>
        <Field.Label>Search</Field.Label>
        <Input>
          <Input.Field type="search" placeholder="Search icons" value={query} onChange={e => onQueryChange(e.target.value)} />
          <Input.TrailingIcon>
            <SearchIconOutlinedRounded width={16} height={16} />
          </Input.TrailingIcon>
        </Input>
      </Field>

      <Field>
        <Field.Label>Category</Field.Label>
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
      </Field>

      <Field>
        <Field.Label>Type</Field.Label>
        <Select value={type} onChange={onTypeChange}>
          <Select.Trigger placeholder="Type" />
          <Select.Content>
            <Select.Viewport>
              {ICON_TYPES.map(t => (
                <Select.Item key={t.value} value={t.value} label={t.label} disabled={!availableTypes.has(t.value)}>
                  {t.label}
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select>
      </Field>

      <Field>
        <Field.Label>Size</Field.Label>
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
      </Field>

      {/* Plain hex box for now — `@takeoff-ui/react-spar` ships no colour picker,
          and pulling the v1 web component in for one control is a bigger call
          than this page should make. Empty means "no override": the glyphs fall
          back to the theme's ink, which is what keeps them legible in both
          schemes. Only a complete six-digit value commits, so the grid does not
          repaint mid-edit. */}
      <Field>
        <Field.Label>Color</Field.Label>
        <Input>
          <Input.Field
            value={colorDraft}
            onChange={e => {
              const raw = e.target.value;
              setColorDraft(raw);
              const next = raw.trim();
              if (next === '') onColorChange(null);
              else if (/^#[0-9a-f]{6}$/iu.test(next)) onColorChange(next.toLowerCase());
            }}
            onBlur={() => setColorDraft(color ?? '')}
            placeholder={PLACEHOLDER_COLOR}
            spellCheck={false}
          />
        </Input>
      </Field>

      {/* A span, not a <label>: a label may only name a single form control, and
          the group carries its own `aria-label` for the same reason as above. */}
      <Field>
        <Field.Label as="span">Icon style</Field.Label>
        <div className={styles.segmented} role="radiogroup" aria-label="Icon style">
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
      </Field>
    </div>
  );
}

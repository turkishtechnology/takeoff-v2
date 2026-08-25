import { useCallback, useEffect, useMemo, useState } from 'react';
import CodeBlock from '@theme/CodeBlock';

import { Accordion, Button, Checkbox, Divider, Drawer, Field, Input, Select } from '@takeoff-ui/react-spar';
import { ReactSparDemoRoot } from '../ReactSparDocs';
import { CopyIconOutlinedRounded } from '@takeoff-icons/react/copy';
import { CheckIconOutlinedRounded } from '@takeoff-icons/react/check';
import { MoonIconOutlinedRounded } from '@takeoff-icons/react/moon';
import { SunIconOutlinedRounded } from '@takeoff-icons/react/sun';
import { iconEntries, type IconGalleryEntry, type IconVariantSvg } from '@site/src/data/icons.generated';
import { ICON_SIZES, ICON_TYPES, PLACEHOLDER_COLOR, titleCase } from './constants';
import { buildIconFormats } from './snippets';
import styles from './styles.module.css';

/**
 * Icon inspector, presented as a bottom sheet rather than a centred dialog: the
 * grid stays visible above it, so you can compare the enlarged preview against
 * its neighbours while stepping through variants.
 *
 * Left half is the preview and its render controls (size, colour, type, filled);
 * right half is the copy-ready snippet for each distribution. The variant
 * controls mirror the gallery toolbar's, but stay local to the sheet so
 * inspecting one icon never re-renders 1k+ cells behind it.
 */

const PREVIEW_SIZE = 96;
const RESET_MS = 2000;
const SHAPE_SUFFIXES = ['circle', 'square'] as const;
const entriesByName = new Map(iconEntries.map(icon => [icon.name, icon]));

/** The gallery publishes circle and square as sibling icons, not SVG variants. */
function getShapeVariants(entry: IconGalleryEntry): IconGalleryEntry[] {
  let baseName = entry.name;

  for (const suffix of SHAPE_SUFFIXES) {
    if (!baseName.endsWith(`-${suffix}`)) continue;
    const candidate = baseName.slice(0, -suffix.length - 1);
    if (entriesByName.has(candidate)) {
      baseName = candidate;
      break;
    }
  }

  return [baseName, ...SHAPE_SUFFIXES.map(suffix => `${baseName}-${suffix}`)].flatMap(name => {
    const icon = entriesByName.get(name);
    return icon ? [icon] : [];
  });
}

function shapeLabel(entry: IconGalleryEntry, variants: IconGalleryEntry[]): string {
  const base = variants[0];
  if (!base || entry.name === base.name) return 'Default';
  return titleCase(entry.name.slice(base.name.length + 1));
}

interface IconDetailDrawerProps {
  /**
   * Preview colour, owned by the gallery rather than the sheet: it is one page-
   * wide setting, so a colour typed in the toolbar shows here too and a colour
   * typed here repaints the grid behind. `null` means no override — the glyphs
   * fall back to the theme's ink.
   */
  color: string | null;
  onColorChange: (value: string | null) => void;
  entry: IconGalleryEntry;
  /** Variant pre-selected from the gallery toolbar, `<style>/<type>`. */
  initialVariant: string;
  /** Preview SVG for the currently shown variant (already resolved by parent). */
  svg: IconVariantSvg | null;
  /** Changes between a base icon and its circle/square siblings. */
  onEntryChange: (entry: IconGalleryEntry) => void;
  /** Called when the sheet's own type/filled controls change the variant. */
  onVariantChange: (variant: string) => void;
  onClose: () => void;
}

export default function IconDetailDrawer({ entry, initialVariant, svg, color, onColorChange, onEntryChange, onVariantChange, onClose }: IconDetailDrawerProps) {
  const [initialStyle, initialType] = initialVariant.split('/');
  const [filled, setFilled] = useState(initialStyle === 'filled');
  const [type, setType] = useState(initialType);
  const [size, setSize] = useState<number>(PREVIEW_SIZE);
  const [previewDark, setPreviewDark] = useState(false);
  const [copiedMeta, setCopiedMeta] = useState(false);

  /* Same draft as the toolbar's: a controlled box that only commits complete
     hex values would reset itself on the first keystroke. */
  const [colorDraft, setColorDraft] = useState(color ?? '');
  useEffect(() => setColorDraft(color ?? ''), [color]);

  // Portal each Select's dropdown INTO the sheet (not <body>). The panel detects
  // "outside" clicks via DOM `contains`, so a dropdown portaled to <body> reads
  // as outside and closes the sheet when an option is picked. Rendering it
  // inside keeps `panel.contains(option)` true. State (not a plain ref) so the
  // Selects re-render once the node is attached.
  const [panel, setPanel] = useState<HTMLDivElement | null>(null);
  const panelRef = useCallback((node: HTMLDivElement | null) => setPanel(node), []);

  /*
   * Per type, not per icon. `add-circle` ships filled cuts for bevel, sharp and
   * tk but not for rounded, so "does it have any filled variant" would offer a
   * toggle that blanks the preview. Whenever `filled` is already on this is true
   * by definition, so the control can never vanish out from under the reader.
   */
  const hasFilledCut = entry.variants.includes(`filled/${type}`);
  const style = filled ? 'filled' : 'outlined';
  const variant = `${style}/${type}`;
  const formats = useMemo(() => buildIconFormats(entry.name, variant), [entry.name, variant]);
  const meta = useMemo(() => [...entry.tags, ...entry.aliases].filter(Boolean).join(', '), [entry.tags, entry.aliases]);
  const shapeVariants = useMemo(() => getShapeVariants(entry), [entry]);

  const handleType = (next: string) => {
    setType(next);
    onVariantChange(`${style}/${next}`);
  };
  const handleFilled = (next: boolean) => {
    setFilled(next);
    onVariantChange(`${next ? 'filled' : 'outlined'}/${type}`);
  };

  async function copyMeta(): Promise<void> {
    try {
      await navigator.clipboard.writeText(meta || entry.name);
      setCopiedMeta(true);
      window.setTimeout(() => setCopiedMeta(false), RESET_MS);
    } catch {
      /* Clipboard denied — the text is selectable in place, so stay quiet. */
    }
  }

  return (
    <ReactSparDemoRoot>
      {/* Non-modal and overlay-less on purpose. A modal drawer locks page scroll
          and puts a pointer-swallowing overlay over the grid; this sheet is an
          inspector for what is still on screen, so the reader can keep scrolling
          and click straight through to another icon — which re-targets the sheet
          rather than closing it. Escape and the close button still dismiss. */}
      <Drawer open modal={false} placement="bottom" onOpenChange={(next: boolean) => (next ? undefined : onClose())}>
        <Drawer.Panel ref={panelRef} className={styles.sheetPanel}>
          <Drawer.Header headerType="light">
            <Drawer.Title level={2} className={styles.sheetTitle}>
              {titleCase(entry.name)}
            </Drawer.Title>
            <Drawer.Close aria-label="Close" />
          </Drawer.Header>

          <Drawer.Body className={styles.sheetBody}>
            {/* Inspect column and its rule share a flex row: a vertical `Divider`
                sizes from its container, so in here it fills the inspect column
                and stops. As a direct child of the body grid it would stretch to
                the tallest column — the accordion — and grow on every expand. */}
            <div className={styles.sheetInspectCol}>
              <div className={styles.sheetInspect}>
                <div className={styles.previewRow}>
                  <div className={styles.previewBox} data-inverted={previewDark || undefined} style={{ color: color ?? undefined }}>
                    {svg ? (
                      <svg
                        className={styles.previewGlyph}
                        viewBox={svg.viewBox}
                        width={size}
                        height={size}
                        role="img"
                        aria-label={entry.name}
                        dangerouslySetInnerHTML={{ __html: svg.svg }}
                      />
                    ) : (
                      <span className={styles.glyphPlaceholder} style={{ width: size, height: size }} aria-hidden="true" />
                    )}
                    {/* Icons ship into both themes; flipping the swatch is the
                      fastest way to catch a glyph that only reads on white. */}
                    <Button
                      className={styles.previewToggle}
                      variant={previewDark ? 'white' : 'black'}
                      appearance="outlined"
                      size="small"
                      onClick={() => setPreviewDark(v => !v)}
                      aria-pressed={previewDark}
                      aria-label={previewDark ? 'Preview on the page background' : 'Preview on the inverted background'}
                      startContent={previewDark ? <SunIconOutlinedRounded width={16} height={16} /> : <MoonIconOutlinedRounded width={16} height={16} />}
                    />
                  </div>

                  <div className={styles.previewControls}>
                    <div className={styles.previewControlRow}>
                      <Field className={styles.field}>
                        <Field.Label>Size</Field.Label>
                        <Select size="small" value={String(size)} onChange={value => setSize(Number(value))}>
                          <Select.Trigger placeholder="Size" />
                          <Select.Content container={panel ?? undefined}>
                            <Select.Viewport>
                              {[...ICON_SIZES, PREVIEW_SIZE].map(s => (
                                <Select.Item key={s} value={String(s)} label={`${s} px`}>
                                  {s} px
                                </Select.Item>
                              ))}
                            </Select.Viewport>
                          </Select.Content>
                        </Select>
                      </Field>

                      {/* Plain hex box, matching the toolbar's. */}
                      <Field className={styles.field}>
                        <Field.Label>Color</Field.Label>
                        <Input size="small">
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
                    </div>

                    <div className={styles.previewControlRow}>
                      <Field className={styles.field}>
                        <Field.Label>Variant</Field.Label>
                        <Select size="small" value={entry.name} disabled={shapeVariants.length < 2} onChange={value => onEntryChange(entriesByName.get(value) ?? entry)}>
                          <Select.Trigger placeholder="Variant" />
                          <Select.Content container={panel ?? undefined}>
                            <Select.Viewport>
                              {shapeVariants.map(shape => (
                                <Select.Item key={shape.name} value={shape.name} label={shapeLabel(shape, shapeVariants)}>
                                  {shapeLabel(shape, shapeVariants)}
                                </Select.Item>
                              ))}
                            </Select.Viewport>
                          </Select.Content>
                        </Select>
                      </Field>

                      <Field className={styles.field}>
                        <Field.Label>Type</Field.Label>
                        <Select size="small" value={type} onChange={handleType}>
                          <Select.Trigger placeholder="Type" />
                          <Select.Content container={panel ?? undefined}>
                            <Select.Viewport>
                              {/* Coverage is not uniform, so a type this icon has no cut
                                  for is offered but not selectable — picking it would
                                  blank the preview. */}
                              {ICON_TYPES.map(t => (
                                <Select.Item key={t.value} value={t.value} label={t.label} disabled={!entry.variants.includes(`${style}/${t.value}`)}>
                                  {t.label}
                                </Select.Item>
                              ))}
                            </Select.Viewport>
                          </Select.Content>
                        </Select>
                      </Field>
                    </div>

                    {hasFilledCut ? (
                      /* `Field` so the label is wired to the checkbox by the
                         component rather than by a wrapping <label>. It stacks by
                         default; `.checkboxField` turns this one into a row. */
                      <Field className={styles.checkboxField}>
                        <Checkbox checked={filled} onChange={handleFilled}>
                          <Checkbox.Indicator />
                        </Checkbox>
                        <Field.Label className={styles.checkboxLabel}>Filled</Field.Label>
                      </Field>
                    ) : null}
                  </div>
                </div>

                <div className={styles.metaBlock}>
                  <span className={styles.blockLabel}>Meta:</span>
                  <span className={styles.metaValue}>{meta || '—'}</span>
                  <Button
                    className={styles.metaCopy}
                    variant={copiedMeta ? 'success' : 'neutral'}
                    appearance="text"
                    size="small"
                    onClick={copyMeta}
                    aria-label="Copy tags"
                    startContent={copiedMeta ? <CheckIconOutlinedRounded width={16} height={16} /> : <CopyIconOutlinedRounded width={16} height={16} />}
                  />
                </div>
              </div>

              <Divider orientation="vertical" decorative className={styles.sheetDivider} />
            </div>

            <div className={styles.sheetCode}>
              <span className={styles.blockLabel}>Code:</span>
              <Accordion type="divided" className={styles.codeAccordion}>
                {formats.map(f => (
                  <Accordion.Item key={f.id} value={f.id}>
                    <Accordion.Header>
                      <Accordion.Trigger>
                        {f.label}
                        <Accordion.Indicator />
                      </Accordion.Trigger>
                    </Accordion.Header>
                    <Accordion.Content className={styles.codePanel}>
                      <CodeBlock language="bash">{f.install}</CodeBlock>
                      <CodeBlock language={f.language}>{f.code}</CodeBlock>
                    </Accordion.Content>
                  </Accordion.Item>
                ))}
              </Accordion>
            </div>
          </Drawer.Body>
        </Drawer.Panel>
      </Drawer>
    </ReactSparDemoRoot>
  );
}

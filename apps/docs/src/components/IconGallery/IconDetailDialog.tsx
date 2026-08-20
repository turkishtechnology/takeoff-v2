import { useCallback, useMemo, useState } from 'react';
import CodeBlock from '@theme/CodeBlock';

import { Dialog, ReactSparDemoRoot, Select, Tabs } from '@site/src/components/ReactSparDocs';
import type { IconGalleryEntry, IconVariantSvg } from '@site/src/data/icons.generated';
import { buildIconFormats, type IconFormatId } from './snippets';
import styles from './styles.module.css';

const STYLES = ['outlined', 'filled'] as const;
const TYPES = ['rounded', 'sharp', 'bevel', 'tk'] as const;

interface IconDetailDialogProps {
  entry: IconGalleryEntry;
  /** Variant pre-selected from the gallery toggle, `<style>/<type>`. */
  initialVariant: string;
  /** Preview SVG for the currently shown variant (already resolved by parent). */
  svg: IconVariantSvg | null;
  /** Called when the dialog's own style/type picker changes the variant. */
  onVariantChange: (variant: string) => void;
  onClose: () => void;
}

export default function IconDetailDialog({ entry, initialVariant, svg, onVariantChange, onClose }: IconDetailDialogProps) {
  const [initialStyle, initialType] = initialVariant.split('/');
  const [style, setStyle] = useState(initialStyle);
  const [type, setType] = useState(initialType);
  const [activeFormat, setActiveFormat] = useState<IconFormatId>('react');

  // Portal each Select's dropdown INTO the dialog panel (not <body>). The panel
  // detects "outside" clicks via DOM `contains`, so a dropdown portaled to
  // <body> reads as outside and closes the dialog when an option is picked.
  // Rendering the dropdown inside the panel keeps `panel.contains(option)` true.
  // State (not a plain ref) so Selects re-render once the node is attached.
  const [panel, setPanel] = useState<HTMLDivElement | null>(null);
  const panelRef = useCallback((node: HTMLDivElement | null) => setPanel(node), []);

  const variant = `${style}/${type}`;
  const formats = useMemo(() => buildIconFormats(entry.name, variant), [entry.name, variant]);

  const handleStyle = (next: string) => {
    setStyle(next);
    onVariantChange(`${next}/${type}`);
  };
  const handleType = (next: string) => {
    setType(next);
    onVariantChange(`${style}/${next}`);
  };

  return (
    <ReactSparDemoRoot>
      <Dialog open onOpenChange={(next: boolean) => (next ? undefined : onClose())}>
        <Dialog.Overlay />
        <Dialog.Panel ref={panelRef} className={styles.dialogPanel}>
          <Dialog.Header headerType="divided">
            <span className={styles.dialogHeading}>
              <span className={styles.dialogPreview}>
                {svg ? (
                  <svg
                    className={styles.dialogGlyph}
                    viewBox={svg.viewBox}
                    width="1em"
                    height="1em"
                    role="img"
                    aria-label={entry.name}
                    dangerouslySetInnerHTML={{ __html: svg.svg }}
                  />
                ) : (
                  <span className={styles.glyphPlaceholder} aria-hidden="true" />
                )}
              </span>
              <span className={styles.dialogTitleBlock}>
                <Dialog.Title level={2} className={styles.dialogTitle}>
                  {entry.name}
                </Dialog.Title>
                <span className={styles.dialogMeta}>
                  <code>{variant}</code>
                  {entry.category ? <span className={styles.dialogCategory}>{entry.category}</span> : null}
                </span>
              </span>
            </span>
            <Dialog.Close className={styles.dialogClose} aria-label="Close" />
          </Dialog.Header>

          <Dialog.Body className={styles.dialogBody}>
            <div className={styles.dialogVariantRow}>
              <label className={styles.field}>
                <span className={styles.fieldLabel}>Style</span>
                <Select value={style} onChange={handleStyle}>
                  <Select.Trigger placeholder="Style" />
                  <Select.Content container={panel ?? undefined}>
                    {STYLES.map(s => (
                      <Select.Item key={s} value={s} label={s}>
                        {s}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
              </label>
              <label className={styles.field}>
                <span className={styles.fieldLabel}>Type</span>
                <Select value={type} onChange={handleType}>
                  <Select.Trigger placeholder="Type" />
                  <Select.Content container={panel ?? undefined}>
                    {TYPES.map(t => (
                      <Select.Item key={t} value={t} label={t}>
                        {t}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
              </label>
            </div>

            <Tabs value={activeFormat} onValueChange={value => setActiveFormat(value as IconFormatId)}>
              <Tabs.List aria-label="Usage format">
                {formats.map(f => (
                  <Tabs.Trigger key={f.id} value={f.id}>
                    {f.label}
                  </Tabs.Trigger>
                ))}
              </Tabs.List>
              {formats.map(f => (
                <Tabs.Content key={f.id} value={f.id} className={styles.formatPanel}>
                  <CodeBlock language="bash">{f.install}</CodeBlock>
                  <div className={styles.codeSlot}>
                    <CodeBlock language={f.language}>{f.code}</CodeBlock>
                  </div>
                </Tabs.Content>
              ))}
            </Tabs>
          </Dialog.Body>
        </Dialog.Panel>
      </Dialog>
    </ReactSparDemoRoot>
  );
}

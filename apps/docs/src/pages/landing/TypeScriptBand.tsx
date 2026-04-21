import type { JSX } from 'react';
import styles from './TypeScriptBand.module.css';

const VARIANTS = ['primary', 'secondary', 'neutral', 'info', 'success', 'danger', 'warning'];

export default function TypeScriptBand(): JSX.Element {
  return (
    <section className={styles.section} aria-labelledby="runway-ts-title">
      <div className={styles.inner}>
        <div className={styles.copy}>
          <span className={styles.eyebrow}>TypeScript, end to end</span>
          <h2 id="runway-ts-title" className={styles.title}>
            The types and the docs describe the same surface.
          </h2>
          <p className={styles.lede}>
            Variants, slot names, and component overrides resolve from the public API itself. That means autocomplete follows the documented contract instead of a parallel,
            accidental type layer.
          </p>
        </div>

        <div className={styles.editor} aria-hidden="true">
          <div className={styles.editorChrome}>
            <span className={styles.dot} />
            <span className={styles.dot} />
            <span className={styles.dot} />
            <span className={styles.filename}>CheckInDialog.tsx</span>
          </div>
          <div className={styles.editorBody}>
            <span className={styles.line}>
              <span className={styles.import}>import</span> {'{'} Button, Dialog, Input {'}'} <span className={styles.import}>from</span>{' '}
              <span className={styles.string}>'@takeoff-ui/react-spar'</span>;
            </span>
            <span className={styles.line}> </span>
            <span className={styles.line}>
              &lt;<span className={styles.tag}>Button</span> <span className={styles.attr}>variant</span>=<span className={styles.string}>"</span>
              <span className={styles.cursor} />
            </span>

            <div className={styles.popover}>
              {VARIANTS.map((v, i) => (
                <div key={v} className={`${styles.popoverItem} ${i === 0 ? styles.popoverItemActive : ''}`}>
                  <span className={styles.popoverIcon}>T</span>
                  <span className={styles.popoverLabel}>{v}</span>
                  <span className={styles.popoverHint}>ButtonVariant</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

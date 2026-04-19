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
            Every prop, every slot, every <code>data-*</code> — typed all the way down.
          </h2>
          <p className={styles.lede}>
            Variants, sizes, modes, slot attribute contracts — all inferred from the source of truth. Autocomplete where you'd expect it, narrowing where you need it, no generics
            trick to learn.
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

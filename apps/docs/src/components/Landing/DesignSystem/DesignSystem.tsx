import { useColorMode } from '@docusaurus/theme-common';
import type { JSX } from 'react';
import styles from './design-system.module.css';

export default function DesignSystem(): JSX.Element {
  const { colorMode } = useColorMode();

  return (
    <section className={styles.section}>
      <div className={styles.sectionInner}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitle}>
            <span>Design Tokens</span>
            <span>Ready to Use</span>
          </div>
          <p className={styles.sectionDesc}>
            This docs app consumes the same Takeoff UI design variables and Docusaurus override layer, so the presentation stays aligned with the source design system.
          </p>
        </div>
        <div className={styles.cardsContainer}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.figmaLogo}>{colorMode === 'dark' ? <img src="img/figma-icon-dark.svg" alt="Figma" /> : <img src="img/figma-icon.svg" alt="Figma" />}</div>
            </div>
            <div className={styles.cardBody}>
              <h3 className={styles.cardTitle}>Takeoff Design System</h3>
              <p className={styles.cardDesc}>
                The page shell is driven by primitives, semantic tokens, radius values, shadows, typography scales, and IFM overrides from Takeoff UI. That keeps Spar documentation
                visually consistent with the upstream system without hand-maintaining duplicate values.
              </p>
            </div>
          </div>
          <div className={styles.imageContainer}>
            <div className={styles.previewImage} data-position="first">
              {colorMode === 'dark' ? <img src="img/design-system-preview-dark.svg" alt="Colors" /> : <img src="img/design-system-preview.svg" alt="Colors" />}
            </div>
            <div className={styles.previewImage} data-position="second">
              {colorMode === 'dark' ? <img src="img/design-system-preview-dark.svg" alt="Typography" /> : <img src="img/design-system-preview.svg" alt="Typography" />}
            </div>
            <div className={styles.previewImage} data-position="third">
              {colorMode === 'dark' ? <img src="img/design-system-preview-dark.svg" alt="Buttons" /> : <img src="img/design-system-preview.svg" alt="Buttons" />}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

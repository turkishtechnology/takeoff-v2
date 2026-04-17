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
            react-spar consumes <code>@takeoff-design/tokens</code> as a peer dependency. Primitives, semantic tokens, radii, shadows, and typography scales stay aligned with the
            rest of the Takeoff system, so visual decisions land once and travel everywhere.
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
                Tokens, icons, fonts, reset rules, and recipes are sourced from <code>@takeoff-design/tokens</code>. Because react-spar ships no bundled component CSS, every
                product adopting it inherits one consistent brand expression across Takeoff surfaces.
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

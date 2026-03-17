import type { JSX } from 'react';
import styles from './design-system.module.css';

export default function DesignSystem(): JSX.Element {
  return (
    <>
      <section className="section-design-system-intro">
        <div className="container">
          <div className="row">
            <div className="col col--6">
              <h1>Design Tokens Ready to Use</h1>
            </div>
            <div className="col col--6">
              <p className={styles.titleDesc}>
                This docs app now consumes the same Takeoff UI design variables and Docusaurus override layer, so the presentation stays aligned with the source design system.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section>
        <div className="container">
          <div className={`row ${styles.designSystem}`}>
            <div className="col col--4">
              <div className={styles.figmaLogo}>
                <img className="theme-image-light" src="img/figma-icon.svg" alt="Figma icon" />
                <img className="theme-image-dark" src="img/figma-icon-dark.svg" alt="Figma icon" />
              </div>
              <h3> Takeoff Design System</h3>
              <p className={styles.designSystemDesc}>
                The page shell is now driven by primitives, semantic tokens, radius values, shadows, typography scales, and IFM overrides from Takeoff UI. That keeps Spar
                documentation visually consistent with the upstream system without hand-maintaining duplicate values here.
              </p>
            </div>
            <div className="col col--8">
              <div className={styles.previewImage}></div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

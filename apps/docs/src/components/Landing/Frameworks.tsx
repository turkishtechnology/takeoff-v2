import type { JSX, ReactNode } from 'react';
import { useColorMode } from '@docusaurus/theme-common';
import styles from './Frameworks.module.css';

type FrameworkIcon = {
  label: string;
  light: string;
  dark: string;
};

type EcosystemCard = {
  title: string;
  icons: FrameworkIcon[];
  description: ReactNode;
};

const frameworkIcons: FrameworkIcon[] = [
  { label: 'React', light: 'img/framework-section/framework-react.svg', dark: 'img/framework-section/framework-react-dark.svg' },
  { label: 'Vue', light: 'img/framework-section/framework-vue.svg', dark: 'img/framework-section/framework-vue-dark.svg' },
  { label: 'Angular', light: 'img/framework-section/framework-angular.svg', dark: 'img/framework-section/framework-angular-dark.svg' },
  { label: 'Web Components', light: 'img/framework-section/framework-stencil.svg', dark: 'img/framework-section/framework-stencil-dark.svg' },
];

const sparIcon: FrameworkIcon = {
  label: 'Spar',
  light: 'img/powered-by-stencil.svg',
  dark: 'img/powered-by-stencil.svg',
};

const ecosystemCards: EcosystemCard[] = [
  {
    title: 'Every Framework',
    icons: frameworkIcons,
    description: (
      <>
        <strong>react-spar</strong> delivers the React experience. Vue, Angular, and Web Component consumers plug into the same design language through <strong>takeoff-ui</strong>.
      </>
    ),
  },
  {
    title: 'Spar, Headless Core',
    icons: [sparIcon],
    description: <>Our headless component library from Turkish Technology. Spar provides the framework-neutral behavior primitives that Takeoff Spar wraps for React.</>,
  },
];

function EcosystemCardView({ title, icons, description }: EcosystemCard) {
  const { colorMode } = useColorMode();
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.iconRow}>
          {icons.map(icon => (
            <img key={icon.label} className={styles.iconFramework} src={colorMode === 'dark' ? icon.dark : icon.light} alt={icon.label} />
          ))}
        </div>
      </div>
      <div className={styles.cardBody}>
        <h3 className={styles.cardTitle}>{title}</h3>
        <p className={styles.cardDesc}>{description}</p>
      </div>
      <div className={styles.cardFooter}>
        <a className={styles.arrowButton} aria-label={`${title} details`}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      </div>
    </div>
  );
}

export default function Frameworks(): JSX.Element {
  return (
    <section className={styles.section}>
      <div className={styles.sectionInner}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitle}>
            <span>One Ecosystem,</span>
            <span>Many Surfaces</span>
          </div>
          <p className={styles.sectionDesc}>
            react-spar is the React expression of the Takeoff UI family. Teams on other frameworks stay connected through adjacent Takeoff packages that share the same tokens,
            vocabulary, and visual contract.
          </p>
        </div>
        <div className={styles.cardGrid}>
          {ecosystemCards.map((props, idx) => (
            <EcosystemCardView key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}

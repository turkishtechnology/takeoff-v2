import type { JSX } from 'react';
import { useColorMode } from '@docusaurus/theme-common';
import styles from './Frameworks.module.css';

type FrameworkItem = {
  title: string;
  Svg: string;
  SvgDark: string;
  description: JSX.Element;
};

const frameworkList: FrameworkItem[] = [
  {
    title: 'React',
    Svg: 'img/framework-section/framework-react.svg',
    SvgDark: 'img/framework-section/framework-react-dark.svg',
    description: <>Takeoff Spar is productized for React first, with a wrapper layer that exposes a stable package surface over the underlying Spar behavior primitives.</>,
  },
  {
    title: 'Angular',
    Svg: 'img/framework-section/framework-angular.svg',
    SvgDark: 'img/framework-section/framework-angular-dark.svg',
    description: (
      <>Keeping the docs layout aligned with Takeoff UI makes it easier to compare implementation phases without losing the shared visual language across framework adapters.</>
    ),
  },
  {
    title: 'Vue',
    Svg: 'img/framework-section/framework-vue.svg',
    SvgDark: 'img/framework-section/framework-vue-dark.svg',
    description: (
      <>The broader Takeoff UI ecosystem remains multi-framework, which makes these docs useful as a design-system reference point rather than an isolated React island.</>
    ),
  },
];

function Framework({ title, Svg, SvgDark, description }: FrameworkItem) {
  const { colorMode } = useColorMode();
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <img className={styles.iconFramework} src={colorMode === 'dark' ? SvgDark : Svg} alt={title} />
      </div>
      <div className={styles.cardBody}>
        <h3 className={styles.cardTitle}>{title}</h3>
        <p className={styles.cardDesc}>{description}</p>
      </div>
      <div className={styles.cardFooter}>
        <a className={styles.arrowButton} aria-label={`${title} documentation`}>
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
            <span>Multiple Library</span>
            <span>Solutions</span>
          </div>
          <p className={styles.sectionDesc}>
            Takeoff UI patterns were designed to scale across framework adapters. This docs shell keeps that same framing while documenting the React Spar phase.
          </p>
        </div>
        <div className={styles.cardGrid}>
          {frameworkList.map((props, idx) => (
            <Framework key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}

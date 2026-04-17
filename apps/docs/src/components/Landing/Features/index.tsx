import type { ComponentProps, ComponentType, JSX, ReactNode } from 'react';
import styles from './styles.module.css';
import FlexibleSvg from '@site/static/img/flexible.svg';
import FrameworkAgnosticSvg from '@site/static/img/framework-agnostic.svg';
import PoweredBySparSvg from '@site/static/img/powered-by-stencil.svg';
import SimpleSvg from '@site/static/img/simple.svg';

type FeatureItem = {
  title: string;
  Svg: ComponentType<ComponentProps<'svg'>>;
  description: ReactNode;
};

const featureList: FeatureItem[] = [
  {
    title: 'React 19 First',
    Svg: SimpleSvg,
    description: <>A focused React 19 wrapper with a typed, stable public API that keeps upgrades predictable.</>,
  },
  {
    title: 'Spar Primitives',
    Svg: PoweredBySparSvg,
    description: (
      <>
        Accessibility and behavior are delivered by <code>@turkish-technology/spar</code>, so proven primitives power every component.
      </>
    ),
  },
  {
    title: 'Token-Driven Styling',
    Svg: FlexibleSvg,
    description: (
      <>
        Visuals flow from <code>@takeoff-design/tokens</code>. Theming and brand updates land in one source of truth.
      </>
    ),
  },
  {
    title: 'Part of Takeoff UI',
    Svg: FrameworkAgnosticSvg,
    description: <>The React surface of the broader Takeoff design system. Shared vocabulary, shared tokens, one roadmap.</>,
  },
];

function Feature({ title, Svg, description }: FeatureItem) {
  return (
    <div className={styles.feature}>
      <div className={styles.featureHeader}>
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className={styles.featureBody}>
        <h2 className={styles.featureTitle}>{title}</h2>
        <p className={styles.featureDesc}>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className={styles.featureGrid}>
        {featureList.map((props, idx) => (
          <Feature key={idx} {...props} />
        ))}
      </div>
    </section>
  );
}

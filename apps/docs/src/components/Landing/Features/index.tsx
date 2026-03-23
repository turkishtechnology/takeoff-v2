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
    title: 'Simple',
    Svg: SimpleSvg,
    description: <>Takeoff Spar keeps the current React wrapper scope narrow, so the package can ship clean behavior and a stable styling contract before expanding outward.</>,
  },
  {
    title: 'Flexible',
    Svg: FlexibleSvg,
    description: <>The docs inherit the broader Takeoff UI visual system while remaining grounded in the actual tokens, slots, and implementation state of this repo.</>,
  },
  {
    title: 'Framework Agnostic',
    Svg: FrameworkAgnosticSvg,
    description: <>Spar provides the primitive behavior layer, which keeps the wrapper strategy portable even when the first productized surface is React-first.</>,
  },
  {
    title: 'Powered By Spar',
    Svg: PoweredBySparSvg,
    description: <>The first slice is a real bridge over Spar primitives, not a mock docs shell. The Button demos in this site render the actual wrapper from this monorepo.</>,
  },
];

function Feature({ title, Svg, description }: FeatureItem) {
  return (
    <div className="col col--3">
      <div className={styles.feature}>
        <div>
          <Svg className={styles.featureSvg} role="img" />
        </div>
        <div>
          <h2>{title}</h2>
          <p className={styles.featureDesc}>{description}</p>
        </div>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {featureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}

import type { JSX } from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import { useRunwaySurface } from '@site/src/hooks/useRunwaySurface';

import HeroRunway from '@site/src/pages/landing/HeroRunway';
import ComponentGrid from '@site/src/pages/landing/ComponentGrid';
import ValueRow from '@site/src/pages/landing/ValueRow';
import OneSurface from '@site/src/pages/landing/OneSurface';
import CustomerLogos from '@site/src/pages/landing/CustomerLogos';
import PhilosophyBand from '@site/src/pages/landing/PhilosophyBand';
import InstallBlock from '@site/src/pages/landing/InstallBlock';
import TypeScriptBand from '@site/src/pages/landing/TypeScriptBand';
import ClosingCTA from '@site/src/pages/landing/ClosingCTA';

export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  useRunwaySurface();

  return (
    <Layout
      title={siteConfig.title}
      description="Documentation for @takeoff-ui/react-spar, the React 19 component library for the Takeoff design system built on Spar primitives and Takeoff design tokens."
    >
      <main data-runway-landing="true">
        <HeroRunway />
        <ComponentGrid />
        <ValueRow />
        <OneSurface />
        <CustomerLogos />
        <PhilosophyBand />
        <InstallBlock />
        <TypeScriptBand />
        <ClosingCTA />
      </main>
    </Layout>
  );
}

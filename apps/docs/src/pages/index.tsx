import type { JSX } from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import { useRunwaySurface } from '@site/src/hooks/useRunwaySurface';

import HeroRunway from '@site/src/components/Landing/HeroRunway';
import ComponentGrid from '@site/src/components/Landing/ComponentGrid';
import ValueRow from '@site/src/components/Landing/ValueRow';
import OneSurface from '@site/src/components/Landing/OneSurface';
import CustomerLogos from '@site/src/components/Landing/CustomerLogos';
import PhilosophyBand from '@site/src/components/Landing/PhilosophyBand';
import InstallBlock from '@site/src/components/Landing/InstallBlock';
import TypeScriptBand from '@site/src/components/Landing/TypeScriptBand';
import ClosingCTA from '@site/src/components/Landing/ClosingCTA';

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

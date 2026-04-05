import type { JSX } from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import HomepageFeatures from '@site/src/components/Landing/Features';
import Frameworks from '@site/src/components/Landing/Frameworks';
import DesignSystem from '@site/src/components/Landing/DesignSystem/DesignSystem';
import Contributors from '@site/src/components/Landing/Contributors';
import PageHeader from '@site/src/components/PageHeader/PageHeader';
import Layout from '@theme/Layout';

export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();

  return (
    <Layout title={`${siteConfig.title}`}>
      <PageHeader />
      <main>
        <HomepageFeatures />
        <Frameworks />
        <DesignSystem />
        <section className="section-image">
          <div className="holder">
            <div className="image"></div>
          </div>
        </section>
        <Contributors />
      </main>
      <div className="bg-point top-right">&nbsp;</div>
      <div className="bg-point middle-right">&nbsp;</div>
      <div className="bg-point middle-left">&nbsp;</div>
    </Layout>
  );
}

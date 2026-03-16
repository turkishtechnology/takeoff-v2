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
        <section>
          <div className="container">
            <br />
            <br />
            <div className="row">
              <div className="col col--6">
                <h1>Powered By Takeoff Spar</h1>
              </div>
            </div>
            <div className="row">
              <div className="col col--12">
                <div
                  style={{
                    color: 'var(--text-base)',
                    fontSize: '32px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <span>Integrated with the live wrapper package and Takeoff UI theme assets</span>
                </div>
              </div>
            </div>
          </div>
        </section>
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

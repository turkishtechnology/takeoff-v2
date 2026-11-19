import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import LandingHeader from '@site/src/components/headless/LandingPage/Header';
import LandingSubHeader from '@site/src/components/headless/LandingPage/SubHeader';
import Features from '@site/src/components/headless/LandingPage/Features';
import AIDriven from '@site/src/components/headless/LandingPage/AIDriven';
import Theming from '@site/src/components/headless/LandingPage/Theming';
import Ending from '@site/src/components/headless/LandingPage/Ending';
import '@site/src/css/headless/LandingPage/index.scss';

export default function Home() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout title={`${siteConfig.title}`}>
      <div className="home-container">
        <main className="home-main">
          <section className="home-section">
            <div className="home-content">
              <LandingHeader />
              <LandingSubHeader />
              <Features />
              <AIDriven />
              <Theming />
            </div>
          </section>
          <Ending />
        </main>
      </div>
    </Layout>
  );
}

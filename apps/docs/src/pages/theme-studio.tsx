import type { JSX } from 'react';
import Layout from '@theme/Layout';
import { useRunwaySurface } from '@site/src/hooks/useRunwaySurface';
import ThemingTeaser from './landing/ThemingTeaser';
import FooterRunway from './landing/FooterRunway';

export default function ThemeStudio(): JSX.Element {
  useRunwaySurface();
  return (
    <Layout title="Theme Studio" description="Live-edit Takeoff Spar tokens and export the result as a CSS file." noFooter>
      <main data-runway-landing="true">
        <ThemingTeaser />
        <FooterRunway />
      </main>
    </Layout>
  );
}

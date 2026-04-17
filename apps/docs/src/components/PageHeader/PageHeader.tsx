import type { JSX } from 'react';
import Gif from '../Landing/Gif/gif';

export default function PageHeader(): JSX.Element {
  return (
    <header className="page-header">
      <div className="container">
        <Gif />
        <img className="theme-image-light" src="img/hero/hero-logo.svg" alt="Takeoff hero" />
        <img className="theme-image-dark" src="img/hero/hero-logo-dark.svg" alt="Takeoff hero" />
        <p className="description">
          Takeoff Spar is the React 19 layer of the Takeoff design system, built on top of <code>@turkish-technology/spar</code> primitives and styled with{' '}
          <code>@takeoff-design/tokens</code>. Product teams adopt it to move faster while staying aligned with a single visual contract across every Takeoff surface.
        </p>
      </div>
    </header>
  );
}

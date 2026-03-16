import Gif from '../Landing/Gif/gif';

export default function PageHeader(): JSX.Element {
  return (
    <header className="page-header">
      <div className="container">
        <Gif />
        <img className="theme-image-light" src="img/hero/hero-logo.svg" alt="Takeoff hero" />
        <img className="theme-image-dark" src="img/hero/hero-logo-dark.svg" alt="Takeoff hero" />
        <p className="description">
          Takeoff Spar is a production-ready React layer for Spar primitives, helping teams move faster while staying aligned with the broader Takeoff UI design system.
        </p>
      </div>
    </header>
  );
}

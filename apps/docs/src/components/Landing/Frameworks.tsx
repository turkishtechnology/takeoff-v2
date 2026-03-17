import type { JSX } from 'react';

type FrameworkItem = {
  title: string;
  stencilSrc: string;
  frameworkSrc: string;
  stencilDarkSrc: string;
  frameworkDarkSrc: string;
  description: JSX.Element;
};

const frameworkList: FrameworkItem[] = [
  {
    title: 'React',
    stencilSrc: 'img/framework-section/framework-stencil.svg',
    frameworkSrc: 'img/framework-section/framework-react.svg',
    stencilDarkSrc: 'img/framework-section/framework-stencil-dark.svg',
    frameworkDarkSrc: 'img/framework-section/framework-react-dark.svg',
    description: <>Takeoff Spar is productized for React first, with a wrapper layer that exposes a stable package surface over the underlying Spar behavior primitives.</>,
  },
  {
    title: 'Vue',
    stencilSrc: 'img/framework-section/framework-stencil.svg',
    frameworkSrc: 'img/framework-section/framework-vue.svg',
    stencilDarkSrc: 'img/framework-section/framework-stencil-dark.svg',
    frameworkDarkSrc: 'img/framework-section/framework-vue-dark.svg',
    description: (
      <>The broader Takeoff UI ecosystem remains multi-framework, which makes these docs useful as a design-system reference point rather than an isolated React island.</>
    ),
  },
  {
    title: 'Angular',
    stencilSrc: 'img/framework-section/framework-stencil.svg',
    frameworkSrc: 'img/framework-section/framework-angular.svg',
    stencilDarkSrc: 'img/framework-section/framework-stencil-dark.svg',
    frameworkDarkSrc: 'img/framework-section/framework-angular-dark.svg',
    description: (
      <>Keeping the docs layout aligned with Takeoff UI makes it easier to compare implementation phases without losing the shared visual language across framework adapters.</>
    ),
  },
];

function Framework({ title, stencilSrc, frameworkSrc, stencilDarkSrc, frameworkDarkSrc, description }: FrameworkItem) {
  return (
    <div className="col col--4">
      <div className="framework">
        <div>
          <img className="frameworkSvg theme-image-light" src={stencilSrc} alt={`${title} stencil`} />
          <img className="frameworkSvg theme-image-light" src={frameworkSrc} alt={title} />
          <img className="frameworkSvg theme-image-dark" src={stencilDarkSrc} alt={`${title} stencil`} />
          <img className="frameworkSvg theme-image-dark" src={frameworkDarkSrc} alt={title} />
        </div>
        <div>
          <h2>{title}</h2>
          <p className="frameworkDesc">{description}</p>
        </div>
      </div>
    </div>
  );
}

export default function Frameworks(): JSX.Element {
  return (
    <section className="section-frameworks">
      <div className="container">
        <div className="row">
          <div className="col col--6">
            <h1>Multiple Library Solutions</h1>
          </div>
          <div className="col col--6">
            <p className="titleDesc">
              Takeoff UI patterns were designed to scale across framework adapters. This docs shell keeps that same framing while documenting the React Spar phase.
            </p>
          </div>
        </div>
        <div className="row">
          {frameworkList.map((props, idx) => (
            <Framework key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}

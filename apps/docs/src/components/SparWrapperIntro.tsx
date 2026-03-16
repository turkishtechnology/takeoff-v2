import type { JSX, ReactNode, SVGProps } from 'react';
import styles from './SparWrapperIntro.module.css';

type SparWrapperIntroProps = {
  sparComponentName: string;
  sparDocsUrl: string;
  specificDescription: ReactNode;
};

function ExternalLinkIcon(props: SVGProps<SVGSVGElement>): JSX.Element {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
      <path
        d="M8.33 4.17H5.83A1.67 1.67 0 0 0 4.17 5.83v8.34a1.67 1.67 0 0 0 1.66 1.66h8.34a1.67 1.67 0 0 0 1.66-1.66v-2.5M10 10l5.83-5.83M11.67 4.17h4.16v4.16"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function SparWrapperIntro({ sparComponentName, sparDocsUrl, specificDescription }: SparWrapperIntroProps): JSX.Element {
  return (
    <div className={styles.root}>
      <p className={styles.description}>{specificDescription}</p>
      <a className={styles.externalLink} href={sparDocsUrl} target="_blank" rel="noreferrer">
        <span>Spar {sparComponentName}</span>
        <ExternalLinkIcon className={styles.externalIcon} />
      </a>
    </div>
  );
}

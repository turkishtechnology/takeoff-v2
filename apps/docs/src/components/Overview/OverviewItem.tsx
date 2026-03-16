import { useColorMode } from '@docusaurus/theme-common';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './overview.module.css';

type OverviewItemProps = {
  title: string;
  href: string;
  image: string;
  imageDark: string;
  isNew?: boolean;
};

function ArrowOutwardIcon(): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.actionIcon}>
      <path d="M7 17L17 7" />
      <path d="M9 7H17V15" />
    </svg>
  );
}

export default function OverviewItem({ title, href, image, imageDark, isNew = false }: OverviewItemProps): JSX.Element {
  const { colorMode } = useColorMode();
  const imageSrc = useBaseUrl(colorMode === 'dark' ? imageDark : image);

  return (
    <a className={styles.cardLink} href={href}>
      <article className={styles.card}>
        <div className={styles.header}>
          <h3 className={styles.title}>{title}</h3>
          <span className={styles.action}>
            <ArrowOutwardIcon />
          </span>
        </div>

        <div className={styles.media}>
          {isNew ? <span className={styles.badge}>new</span> : null}
          <img className={styles.image} src={imageSrc} alt={`${title} preview`} loading="lazy" />
        </div>
      </article>
    </a>
  );
}

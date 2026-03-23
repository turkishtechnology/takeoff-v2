import type { JSX } from 'react';
import OverviewItem from './OverviewItem';
import { overviewItems } from '../../data/overview-items';
import styles from './overview.module.css';

export default function OverviewHolder(): JSX.Element {
  return (
    <div className={styles.grid}>
      {overviewItems.map(item => (
        <OverviewItem key={item.title} {...item} />
      ))}
    </div>
  );
}

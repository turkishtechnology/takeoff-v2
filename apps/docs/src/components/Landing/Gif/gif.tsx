import styles from './gif.module.css';

export default function Gif(): JSX.Element {
  return (
    <div className={styles.container}>
      <span className={styles.scope}>@takeoff-ui</span>
      <span className={styles.slash}>/</span>
      <span className={styles.package}>react-spar</span>
    </div>
  );
}

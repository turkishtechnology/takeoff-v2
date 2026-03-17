import type { JSX } from 'react';
import styles from './contributors.module.css';

const contributors = [
  { name: 'Harun Demir', role: 'Frontend Developer', image: 'img/contributors/harun-demir.jpg' },
  { name: 'Ulaş Turan', role: 'Frontend Developer', image: 'img/contributors/ulas-turan.jpeg' },
  { name: 'Onur Palaz', role: 'Frontend Developer', image: 'img/contributors/onur-palaz.jfif' },
  { name: 'Efe Özdemir', role: 'Full Stack Developer', image: 'img/contributors/efe-ozdemir.jpg' },
  { name: 'Pınar Yalçınduran', role: 'Frontend Developer', image: 'img/contributors/pinar-yalcinduran.png' },
  { name: 'İbrahim Agah Gürer', role: 'Frontend Developer', initials: 'İA' },
  { name: 'Atakan Erhan Bayil', role: 'Frontend Developer', image: 'img/contributors/atakan-bayil.JPG' },
  { name: 'Kıvanç Eski', role: 'Frontend Developer', image: 'img/contributors/kivanc-eski.png' },
  { name: 'Hayrunnisa Çiko', role: 'Frontend Developer', image: 'img/contributors/hayrunnisa-ciko.jpg' },
];

export default function Contributors(): JSX.Element {
  return (
    <section>
      <div className="container">
        <h1>Contributors</h1>
        <p className={styles.description}>
          This project thrives thanks to the contributors shipping wrapper code, styling bridges, and docs improvements across the shared design system.
        </p>
        <div className={styles.strip}>
          {contributors.map(contributor => (
            <div key={contributor.name} className={styles.avatarWrap} title={`${contributor.name} - ${contributor.role}`}>
              {contributor.image ? (
                <img className={styles.avatar} src={contributor.image} alt={contributor.name} loading="lazy" />
              ) : (
                <span className={styles.fallback} aria-label={contributor.name}>
                  {contributor.initials}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

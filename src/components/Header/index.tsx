/* eslint-disable prettier/prettier */
import Link from 'next/link';
import styles from './header.module.scss';

export default function Header(): JSX.Element {
  return (
    <div className={styles.container}>
      <Link href="/" passHref>
        <img src="/images/Logo.svg" alt="Logo" />
      </Link>
    </div>
  );
}

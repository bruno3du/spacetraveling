import Image from 'next/image';
import Link from 'next/link';
import styles from './header.module.scss';

export default function Header(): JSX.Element {
  return (
    <header className={styles.container}>
      <Link href="/" passHref>
        <a>
          <Image src="/logo.svg" alt="logo" width="238px" height="25.63px" />
        </a>
      </Link>
    </header>
  );
}

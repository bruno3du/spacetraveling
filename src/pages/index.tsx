import { GetStaticProps } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { FiCalendar, FiUser } from 'react-icons/fi';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import Header from '../components/Header';

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  function handleDate(date): string {
    const newDate = format(date, 'PP', {
      locale: ptBR,
    });

    return newDate;
  }

  return (
    <div className={commonStyles.container}>
      <Header />
      <main className={styles.container}>
        <section>
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={`${index + 2} postX`} className={styles.posts}>
              <Link
                href={{
                  pathname: '/post/[slug]',
                  query: { slug: 'my-post' },
                }}
                passHref
              >
                <a>
                  <h2>Como utilizar Hooks</h2>
                </a>
              </Link>
              <p>
                Tudo sobre como criar a sua primeira aplicação utilizando Create
                React App
              </p>
              <div className={styles.posts_footer}>
                <div className={styles.posts_footer__time}>
                  <FiCalendar />
                  <time>{handleDate(new Date())}</time>
                </div>
                <div className={styles.posts_footer__author}>
                  <FiUser />
                  <p>Joseph Oliveira</p>
                </div>
              </div>
            </div>
          ))}
        </section>
        <button type="button">Carregar mais posts</button>
      </main>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query('');
  console.log(postsResponse, 'teste');

  return {
    props: {
      user: ['jorge'],
    },
  };
};

import { GetStaticProps } from 'next';
import Link from 'next/link';
import Head from 'next/head';
import { FiCalendar, FiUser } from 'react-icons/fi';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { useState } from 'react';
import { predicate } from '@prismicio/client';
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
  const [posts, setPosts] = useState(postsPagination.results as Post[]);
  const [nextPage, setNextPage] = useState<string>(
    postsPagination.next_page || null
  );

  function handleDate(date: string): string {
    const newDate = new Date(date);
    const formatedDate = format(newDate, 'PP', {
      locale: ptBR,
    });

    return formatedDate;
  }

  async function handleMoreArticles(api: string): Promise<void> {
    const response = await fetch(api);
    const data = await response.json();

    const { results, ...rest } = data;
    const { next_page } = rest;

    await results.forEach((ele: Post) => {
      const newPost = {
        uid: ele.uid,
        first_publication_date: ele.first_publication_date,
        data: {
          title: ele.data.title,
          subtitle: ele.data.subtitle,
          author: ele.data.author,
        },
      };

      setPosts([...posts, newPost]);
    });

    setNextPage(next_page);
  }

  return (
    <>
      <Head>
        <title>Home | spacetraveling.</title>
      </Head>
      <Header />
      <div className={commonStyles.container}>
        <main className={styles.container}>
          <section>
            {posts.map((post, index) => (
              <div key={`${index + 2} postX`} className={styles.posts}>
                <Link href={`/post/${post.uid}`} passHref>
                  <a>
                    <h2>{post?.data.title}</h2>
                  </a>
                </Link>
                <p>{post?.data?.subtitle}</p>
                <div className={styles.posts_footer}>
                  <div className={styles.posts_footer__time}>
                    <FiCalendar />
                    <time>{handleDate(post.first_publication_date)}</time>
                  </div>
                  <div className={styles.posts_footer__author}>
                    <FiUser />
                    <p>{post?.data?.author}</p>
                  </div>
                </div>
              </div>
            ))}
          </section>
          {nextPage && (
            <button type="button" onClick={() => handleMoreArticles(nextPage)}>
              Carregar mais posts
            </button>
          )}
        </main>
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();

  const postsResponse = await prismic.query(
    [predicate.at('document.type', 'post')],
    { pageSize: 1 }
  );

  const { results, next_page } = postsResponse;

  const posts: Post[] = results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });

  return {
    props: {
      postsPagination: {
        results: posts,
        next_page,
      },
    },
  };
};

import { GetStaticProps } from 'next';
import Link from 'next/link';

import { FiCalendar, FiUser } from 'react-icons/fi';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { useEffect, useState } from 'react';
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
  posts: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  const [posts, setPosts] = useState([] as Post[]);
  const [nextPage, setNextPage] = useState<string>(null);

  useEffect(() => {
    if (postsPagination?.posts) setPosts(postsPagination.posts);
    if (postsPagination?.next_page) setNextPage(postsPagination.next_page);
  }, []);

  function handleDate(date): string {
    const newDate = format(date, 'PP', {
      locale: ptBR,
    });

    return newDate;
  }

  async function handleMoreArticles(api: string): Promise<void> {
    const response = await fetch(api);
    const data = await response.json();

    const { results, ...rest } = data;
    const { next_page } = rest;

    console.log(results);

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
  console.log(posts);
  return (
    <div className={commonStyles.container}>
      <Header />
      <main className={styles.container}>
        <section>
          {posts.map((post, index) => (
            <div key={`${index + 2} postX`} className={styles.posts}>
              <Link
                href={{
                  pathname: '/post/[slug]',
                  query: { slug: post.uid },
                }}
                passHref
              >
                <a>
                  <h2>{post?.data?.title}</h2>
                </a>
              </Link>
              <p>{post?.data?.subtitle}</p>
              <div className={styles.posts_footer}>
                <div className={styles.posts_footer__time}>
                  <FiCalendar />
                  <time>{handleDate(new Date())}</time>
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
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();

  const postsResponse = await prismic.getByType('post', {
    pageSize: 1,
  });

  const { results, ...postRest } = postsResponse;

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
        posts,
        next_page: postRest.next_page,
      },
    },
  };
};

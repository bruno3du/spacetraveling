import { GetStaticPaths, GetStaticProps } from 'next';
import { format } from 'date-fns';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import Image from 'next/image';
import ptBR from 'date-fns/locale/pt-BR';
import { predicate } from '@prismicio/client';
import { RichText, RichTextBlock } from 'prismic-reactjs';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: RichTextBlock[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  const router = useRouter();

  function handleDate(date: string): string {
    const newDate = new Date(date);
    const formatedDate = format(newDate, 'PP', {
      locale: ptBR,
    });

    return formatedDate;
  }

  function handleReadingTime(words): number {
    let amountWords = 0;
    words.forEach(word => {
      const newWord = RichText.asText(word.body);
      const numberWords = newWord.split(' ').length;
      amountWords += numberWords;
    });

    const wordPerMinuts = 200;

    return Math.ceil(amountWords / wordPerMinuts);
  }

  if (router.isFallback) {
    return (
      <>
        <Header />
        <main className={styles.container}>Carregando...</main>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{post.data.title} | spacetraveling.</title>
      </Head>
      <Header />
      <main className={styles.container}>
        <figure>
          <Image src="/post.png" alt="post" layout="fill" objectFit="cover" />
        </figure>
        <article className={`${styles.post} ${commonStyles.container}`}>
          <h1>{post.data.title}</h1>
          <div className={styles.post_info}>
            <div>
              <FiCalendar />
              <time>{handleDate(post.first_publication_date)}</time>
            </div>
            <div>
              <FiUser />
              {post.data.author}
            </div>
            <div>
              <FiClock /> {handleReadingTime(post.data.content)} min
            </div>
          </div>
          <div className={styles.post_content}>
            {post.data.content.map(content => (
              <div key={content.heading}>
                <h2>{content.heading}</h2>
                <RichText render={content.body} />
              </div>
            ))}
          </div>
        </article>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const postsFetch = await prismic.query([
    predicate.at('document.type', 'post'),
  ]);

  const post = postsFetch.results.map(ele => {
    return {
      params: { slug: ele.uid },
    };
  });

  return {
    paths: post,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;
  const prismic = getPrismicClient();
  const post = await prismic.getByUID('post', slug as string);

  return {
    props: {
      post,
    },
  };
};

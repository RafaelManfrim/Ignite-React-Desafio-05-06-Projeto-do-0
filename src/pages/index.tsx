import { GetStaticProps } from 'next';
import Link from 'next/link';
import Prismic from '@prismicio/client';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { useState } from 'react';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import Header from '../components/Header';

interface Post {
  slug?: string;
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
  postPagination: PostPagination;
}

export default function Home({ postPagination }: HomeProps): JSX.Element {
  const [posts, setPosts] = useState<Post[]>(postPagination.results);

  async function handleNextPageClick(): Promise<void> {
    console.log(postPagination.next_page);
    // const newPosts = [...posts, response.results];
    // setPosts(newPosts);
  }

  function renderPosts(): JSX.Element[] {
    return posts.map(post => (
      <div className={styles.post} key={post.slug}>
        <Link href={`/post/${post.slug}`}>
          <a>
            <h1>{post.data.title}</h1>
            <h3>{post.data.subtitle}</h3>
            <div className={commonStyles.postInfos}>
              <div>
                <FiCalendar /> {post.first_publication_date}
              </div>
              <div>
                <FiUser /> {post.data.author}
              </div>
            </div>
          </a>
        </Link>
      </div>
    ));
  }
  return (
    <main className={commonStyles.container}>
      <Header />
      <section className={styles.posts}>{renderPosts()}</section>
      {postPagination.next_page && (
        <button
          type="button"
          className={styles.loadMorePostsButton}
          onClick={handleNextPageClick}
        >
          Carregar mais posts
        </button>
      )}
    </main>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: ['posts.title', 'posts.subtitle', 'posts.author'],
      pageSize: 4,
    }
  );

  const posts = postsResponse.results.map(post => {
    return {
      slug: post.uid,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
      first_publication_date: new Date(post.first_publication_date)
        .toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
        .replace('de', '')
        .replace('. de', ''),
    };
  });

  return {
    props: {
      postPagination: {
        results: posts,
        next_page: postsResponse.next_page,
      },
    },
  };
};

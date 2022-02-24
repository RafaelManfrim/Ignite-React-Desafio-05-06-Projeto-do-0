import { GetStaticPaths, GetStaticProps } from 'next';
import Prismic from '@prismicio/client';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
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
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  // TODO
  console.log(post);
  return (
    <main className={commonStyles.container}>
      <Header />
      <section className={styles.post}>
        <img
          src={post.data.banner.url}
          alt="Capa do post"
          className={styles.banner}
        />
        <h1>{post.data.title}</h1>
        <div className={commonStyles.postInfos}>
          <div>
            <FiCalendar /> {post.first_publication_date}
          </div>
          <div>
            <FiUser /> {post.data.author}
          </div>
          <div>
            <FiClock /> 4 min
          </div>
        </div>
        {/* <p>{post.data.content}</p> */}
      </section>
    </main>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query([
    Prismic.predicates.at('document.type', 'posts'),
  ]);

  // const response = await prismic.getByUID('post', String(slug), {})
  console.log(posts);

  // TODO
  return {
    paths: [{ params: {} }],
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async context => {
  const prismic = getPrismicClient();
  const postId = context.params.slug;
  const response = await prismic.getByUID('posts', postId[0], {});

  const post = {
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      author: response.data.author,
      banner: response.data.banner,
      content: response.data.content,
    },
    first_publication_date: new Date(response.first_publication_date)
      .toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
      .replace('de', '')
      .replace('. de', ''),
  };

  return {
    props: {
      post,
    },
  };
};

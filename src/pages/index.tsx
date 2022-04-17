/* eslint-disable prettier/prettier */
import { useState } from 'react';
import { GetStaticProps } from 'next';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import Link from 'next/link';
import Head from 'next/head';
import { IconContext } from 'react-icons';
import { FiCalendar, FiUser } from 'react-icons/fi';
import Prismic from '@prismicio/client';
import { getPrismicClient } from '../services/prismic';
import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import Header from '../components/Header';
import Post from './post/[slug]';

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

export default function Home(postsPagination: HomeProps): JSX.Element {
  const formattedPost = postsPagination.results.map(post => {
    return {
      ...post,
      first_publication_date: format(
        new Date(post.first_publication_date),
        'dd MMM yyyy',
        {
          locale: ptBR,
        }
      ),
    };
  });

  const [posts, setPosts] = useState<Post[]>(formattedPost);
  const [nextPage, setNextPage] = useState(postsPagination.next_page);
  const [currentPage, setCurrentPage] = useState(1);

  async function handleNextPage(): Promise<void> {
    if (currentPage !== 1 && nextPage === null) {
      return;
    }

    const postResults = await fetch(`${nextPage}`).then(response =>
      response.json()
    );

    setNextPage(postResults.next_page);
    setCurrentPage(postResults.page);

    const newPosts = postResults.results.map(post => {
      return {
        uid: post.uid,
        first_publication_date: format(
          new Date(post.first_publication_date),
          'dd MMM yyyy',
          {
            locale: ptBR,
          }
        ),
        data: {
          title: post.data.title,
          subtitle: post.data.subtitle,
          author: post.data.author,
        },
      };
    });

    setPosts([...posts, ...newPosts]);
  }

  return (
    <>
      <Head>
        <title>Home | spacetravelling </title>
      </Head>
      <div className={styles.container}>
        <div className={styles.subContainer}>
          <div className={styles.header}>
            <Header />
          </div>

          <div className={styles.posts}>
            {posts.map(post => (
              <Link href={`/post/${post.uid}`} key={post.uid}>
                <div className={styles.containerPost}>
                  <span className={styles.title}>{post.data.title}</span>
                  <span className={styles.subtitle}>{post.data.subtitle}</span>
                  <div className={styles.info}>
                    <div className={styles.createdat}>
                      <IconContext.Provider value={{ color: '#bbbbbb' }}>
                        <div>
                          <FiCalendar />
                        </div>
                      </IconContext.Provider>
                      <span> {post.first_publication_date}</span>
                    </div>
                    <div className={styles.author}>
                      <IconContext.Provider value={{ color: '#bbbbbb' }}>
                        <div>
                          <FiUser />
                        </div>
                      </IconContext.Provider>
                      <span>{post.data.author}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {nextPage && (
            <div className={styles.loadPostsContainer}>
              <button
                type="button"
                className={styles.loadPosts}
                onClick={handleNextPage}
              >
                Carregar mais posts
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'post')],
    {
      pageSize: 2,
    }
  );

  const posts = postsResponse.results.map(post => {
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

  const postsPagination = {
    next_page: postsResponse.next_page,
    results: posts,
  };

  return {
    props: postsPagination,
  };
};

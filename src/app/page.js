"use client";

import { useQuery, useQueries } from "@tanstack/react-query";
import { CardPost } from "@/components/CardPost";
import { Spinner } from "@/components/Spinner";
import styles from "./page.module.css";
import Link from "next/link";

const fetchPosts = async ({ page }) => {
  const results = await fetch(`http://localhost:3000/api/posts?page=${page}`);

  const data = await results.json();

  return data;
};

export const fetchPostRating = async ({ postId }) => {
  const results = await fetch(
    `http://localhost:3000/api/post?postId=${postId}`
  );

  const data = results.json();

  return data;
};

export default function Home({ searchParams }) {
  const currentPage = parseInt(searchParams?.page || 1);
  const searchTerm = searchParams?.q;

  const {
    data: posts,
    isLoading, // Retorna o estado de primeiro carregamento dos dados
    isFetching, // Retorna o estado se a query esta fazendo alguma requisição
  } = useQuery({
    queryKey: ["posts", currentPage], // ID unico para gerenciamento de cache do react-query
    queryFn: () => fetchPosts({ page: currentPage }), //especifica função que busca os dados
    //staleTime: 2000, // Tempo de vida do cache
    //gcTime: 3000, // Garbage collection time (tempo para limpar cache/memoria)
    //refetchInterval: 2000, // Intervalo de tempo para refazer a requisição
    //refetchOnWindowFocus: false, // Refazer a requisição quando a janela ganha foco
  });

  const postRatingQueries = useQueries({
    // useQueries é uma função que permite fazer várias queries ao mesmo tempo
    queries:
      posts?.data.length > 0
        ? posts.data.map((post) => ({
            queryKey: ["postHome", post.id],
            queryFn: () => fetchPostRating({ postId: post.id }),
            enabled: !!post.id,
          }))
        : [],
  });

  console.log("postRatingQueries", postRatingQueries);

  const ratingsAndCartegoriesMap = postRatingQueries?.reduce((acc, query) => {
    if (!query.isPending && query.data && query.data.id) {
      acc[query.data.id] = query.data;
    }
    return acc;
  }, {});

  return (
    <main className={styles.grid}>
      {isLoading && (
        <div className={styles.spinner}>
          <Spinner />
        </div>
      )}
      {posts?.data?.map((post) => (
        <CardPost
          key={post.id}
          post={post}
          rating={ratingsAndCartegoriesMap?.[post.id]?.rating}
          category={ratingsAndCartegoriesMap?.[post.id]?.category}
          isFetching={isFetching}
        />
      ))}
      <div className={styles.links}>
        {posts?.prev && (
          <Link
            href={{
              pathname: "/",
              query: { page: posts?.prev, q: searchTerm },
            }}
          >
            Página anterior
          </Link>
        )}
        {posts?.next && (
          <Link
            href={{
              pathname: "/",
              query: { page: posts?.next, q: searchTerm },
            }}
          >
            Próxima página
          </Link>
        )}
      </div>
    </main>
  );
}

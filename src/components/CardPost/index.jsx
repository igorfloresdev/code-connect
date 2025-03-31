import { useMutation, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { Avatar } from "../Avatar";
import { Star } from "../icons/Star";
import styles from "./cardpost.module.css";
import Link from "next/link";
import { ThumbsUpButton } from "./ThumbsUpButton";
import { ModalComment } from "../ModalComment";

export const CardPost = ({
  post,
  highlight,
  rating,
  category,
  isFetching,
  currentPage,
}) => {
  const queryClient = useQueryClient();

  // Hook da mutation, utilizado para realizar operações de update, delete e update
  const thumbsMutation = useMutation({
    mutationFn: (postData) => {
      return fetch("http://localhost:3000/api/thumbs", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(postData),
      }).then((response) => {
        if (!response.ok) {
          throw new Error(`HTTTP Error! status ${response.status}`);
        }
        return response.json();
      });
    },
    onMutate: async () => {
      const postQueryKey = ["post", post.slug];

      // Cancelar queries em voo para post detalhe do post
      await queryClient.cancelQueries(postQueryKey);

      const prevPost = queryClient.getQueryData(postQueryKey);

      //atualizar um único post
      if (prevPost) {
        queryClient.setQueryData(postQueryKey, {
          ...prevPost,
          likes: prevPost.likes + 1,
        });
      }

      return { prevPost };
    },
    onSuccess: () => {
      if (currentPage) {
        // invalidação queries
        queryClient.invalidateQueries(["posts", currentPage]);
      }
    },
    onError: (error, variables, context) => {
      console.error(
        `Erro ao salvar o thumbsUp para o slug: ${variables.slug}`,
        { error }
      );
      if (context.prevPost) {
        queryClient.setQueryData(["post", post.slug], context.prevPost);
      }
    },
  });

  //Atualização otimista via UI
  // useEffect(() => {
  //   if (thumbsMutation.isPending && thumbsMutation.variables) {
  //     post.likes = post.likes + 1;
  //   }
  // }, [thumbsMutation.isPending, thumbsMutation.variables]);

  const submitCommentMutation = useMutation({
    mutationFn: (commentData) => {
      return fetch(`http://localhost:3000/api/comment/${post.id}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(commentData),
      });
    },
    onSuccess: () => {
      // invalidação queries
      queryClient.invalidateQueries(["post", post.slug]);
      queryClient.invalidateQueries(["posts", currentPage]);
    },
    onError: (error, variables) => {
      console.error(
        `Erro ao salvar o comentário para o slug: ${variables.slug}`,
        { error }
      );
    },
  });

  const onSubmitComment = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const text = formData.get("text");

    submitCommentMutation.mutate({ id: post.id, text });
  };

  return (
    <article className={styles.card} style={{ width: highlight ? 993 : 486 }}>
      <header className={styles.header}>
        <figure style={{ height: highlight ? 300 : 133 }}>
          <Image
            src={post.cover}
            fill
            alt={`Capa do post de titulo: ${post.title}`}
          />
        </figure>
      </header>
      <section className={styles.body}>
        <h2>{post.title}</h2>
        <p>{post.body}</p>
        <Link href={`/posts/${post.slug}`}>Ver detalhes</Link>
      </section>
      <footer className={styles.footer}>
        <div className={styles.actions}>
          <form
            onClick={(event) => {
              event.preventDefault();
              thumbsMutation.mutate({ slug: post.slug }); //Executa a mutation
            }}
          >
            <ThumbsUpButton disable={isFetching} />
            {thumbsMutation.isError && (
              <p className={styles.ThumbsUpButtonMessage}>
                Oops, ocorreu um erro ao salvar thumbsUp
              </p>
            )}
            <p>{post.likes}</p>
          </form>
          <div>
            <ModalComment onSubmit={(e) => onSubmitComment(e)} />
            <p>{post.comments.length}</p>
          </div>
          {rating && (
            <div style={{ margin: "0 3px" }}>
              <Star />
              <p style={{ marginTop: "1px" }}>{rating}</p>
            </div>
          )}
        </div>
        {category && (
          <div
            className={styles.categoryWrapper}
            style={{ fontSize: highlight ? "15px" : "12px" }}
          >
            <span className={styles.label}>Categoria: </span>{" "}
            <span className={styles.category}>{category}</span>
          </div>
        )}
        <Avatar imageSrc={post.author.avatar} name={post.author.username} />
      </footer>
    </article>
  );
};

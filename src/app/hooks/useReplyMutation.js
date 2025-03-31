import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useReplyMutation = ({ slug }) => {
  const queryClient = useQueryClient();

  const replyMutation = useMutation({
    mutationFn: (commentData) => {
      return fetch(
        `http://localhost:3000/api/comment/${commentData.comment.postId}/replies`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(commentData),
        }
      );
    },

    onSuccess: () => {
      queryClient.invalidateQueries(["post", slug]);
    },
    onError: (error, variables) => {
      console
        .error(`Erro ao salvar o comentário para o slug: ${variables.slug}`, {
          error,
        })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTTP Error! status ${response.status}`);
          }

          return response.error;
        });
    },
  });
  return {
    mutate: ({ comment, text }) => replyMutation.mutate({ comment, text }),
    status: replyMutation.status,
    error: replyMutation.error,
    isError: replyMutation.isError,
    isSuccess: replyMutation.isSuccess,
  };
};

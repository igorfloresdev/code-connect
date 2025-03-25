import { useQuery } from "@tanstack/react-query";

export const fetchReplies = async ({ commentId, slug }) => {
  const response = await fetch(
    `http://localhost:3000/api/comment/${commentId}/replies?slug=${slug}`
  );
  if (!response.ok) {
    throw new Error("A resposta de rede não está OK");
  }

  return response.json();
};

export const useFetchReplies = ({ commentId, slug }) => {
  return useQuery({
    queryKey: ["replies", commentId, slug],
    queryFn: async () => fetchReplies({ commentId, slug }),
    enabled: !!commentId && !!slug, // Só executa a query se commentId e slug estiverem definidos
    retry: 5, // Tenta 5 vezes antes de falhar
    // retryDelay: 500, // Aguarda 500ms entre as tentativas
  });
};

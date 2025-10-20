"use client"

import {
  bulkDeleteArticles,
  createArticle,
  deleteArticle,
  getUserProjectWithArticles,
} from "@/lib/actions/articles"
import type { Article } from "@prisma/client"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export type ArticleWithAnalytics = Article

export const articlesKeys = {
  all: ["articles"] as const,
  lists: () => [...articlesKeys.all, "list"] as const,
  list: () => [...articlesKeys.lists()] as const,
}

export const useArticles = () => {
  return useQuery({
    queryKey: articlesKeys.list(),
    queryFn: async (): Promise<ArticleWithAnalytics[]> => {
      const project = await getUserProjectWithArticles()

      if (!project) {
        return []
      }

      return project.articles
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useCreateArticle = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      title: string
      excerpt: string
      content: string
      status: "draft" | "published"
      coverImage?: string
    }) => {
      return await createArticle(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: articlesKeys.lists() })
    },
  })
}

export const useDeleteArticle = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (articleId: string) => {
      await deleteArticle(articleId)
    },
    onMutate: async (articleId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: articlesKeys.lists() })

      // Snapshot the previous value
      const previousArticles = queryClient.getQueryData<ArticleWithAnalytics[]>(articlesKeys.list())

      // Optimistically update to the new value
      if (previousArticles) {
        queryClient.setQueryData<ArticleWithAnalytics[]>(
          articlesKeys.list(),
          previousArticles.filter(article => article.id !== articleId)
        )
      }

      return { previousArticles }
    },
    onError: (_err, _articleId, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousArticles) {
        queryClient.setQueryData(articlesKeys.list(), context.previousArticles)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: articlesKeys.lists() })
    },
  })
}

export const useBulkDeleteArticles = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (articleIds: string[]) => {
      await bulkDeleteArticles(articleIds)
    },
    onMutate: async (articleIds) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: articlesKeys.lists() })

      // Snapshot the previous value
      const previousArticles = queryClient.getQueryData<ArticleWithAnalytics[]>(articlesKeys.list())

      // Optimistically update to the new value
      if (previousArticles) {
        queryClient.setQueryData<ArticleWithAnalytics[]>(
          articlesKeys.list(),
          previousArticles.filter(article => !articleIds.includes(article.id))
        )
      }

      return { previousArticles }
    },
    onError: (_err, _articleIds, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousArticles) {
        queryClient.setQueryData(articlesKeys.list(), context.previousArticles)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: articlesKeys.lists() })
    },
  })
}

"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  bulkDeleteArticles,
  createArticle,
  deleteArticle,
  getUserProjectWithArticles,
} from "@/lib/actions/articles"
import { getBatchArticleViewsOverTime } from "@/lib/actions/analytics"
import type { Article } from "@prisma/client"

export type ArticleWithAnalytics = Article & {
  viewsOverTime?: Array<{ date: string; views: number }>
}

export const articlesKeys = {
  all: ["articles"] as const,
  lists: () => [...articlesKeys.all, "list"] as const,
  list: () => [...articlesKeys.lists()] as const,
  analytics: (articleIds: string[]) => [...articlesKeys.all, "analytics", articleIds] as const,
}

export const useArticles = () => {
  return useQuery({
    queryKey: articlesKeys.list(),
    queryFn: async (): Promise<ArticleWithAnalytics[]> => {
      const project = await getUserProjectWithArticles()

      if (!project) {
        return []
      }

      const articles = project.articles

      if (articles.length === 0) {
        return []
      }

      // Fetch analytics for all articles in a single optimized batch query
      const articleIds = articles.map(a => a.id)
      const viewsDataMap = await getBatchArticleViewsOverTime(articleIds, 7)

      return articles.map(article => ({
        ...article,
        viewsOverTime: viewsDataMap.get(article.id) || []
      }))
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

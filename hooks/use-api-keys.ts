"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  createApiKey as createApiKeyAction,
  deleteApiKey as deleteApiKeyAction,
  getProjectApiKeys,
} from "@/lib/actions/api-keys"
import { getUserProjects } from "@/lib/actions/projects"
import type { ApiKey } from "@prisma/client"

export type ApiKeySelect = Pick<
  ApiKey,
  "id" | "name" | "key" | "type" | "permissions" | "lastUsedAt" | "expiresAt" | "status" | "createdAt"
>

export const apiKeysKeys = {
  all: ["api-keys"] as const,
  lists: () => [...apiKeysKeys.all, "list"] as const,
  list: (projectId: string) => [...apiKeysKeys.lists(), projectId] as const,
}

export const useApiKeys = () => {
  return useQuery({
    queryKey: apiKeysKeys.lists(),
    queryFn: async (): Promise<{ apiKeys: ApiKeySelect[]; projectId: string | null }> => {
      const projects = await getUserProjects()
      const project = projects[0]

      if (!project) {
        return { apiKeys: [], projectId: null }
      }

      const apiKeys = await getProjectApiKeys(project.id)
      return { apiKeys, projectId: project.id }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useCreateApiKey = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      projectId: string
      name: string
      type?: "secret" | "public"
      permissions?: string[]
      expiresInDays?: number | null
    }) => {
      const { projectId, ...input } = data
      return await createApiKeyAction(projectId, input)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiKeysKeys.lists() })
    },
  })
}

export const useDeleteApiKey = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (apiKeyId: string) => {
      await deleteApiKeyAction(apiKeyId)
    },
    onMutate: async (apiKeyId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: apiKeysKeys.lists() })

      // Snapshot the previous value
      const previousData = queryClient.getQueryData<{ apiKeys: ApiKeySelect[]; projectId: string | null }>(
        apiKeysKeys.lists()
      )

      // Optimistically update to the new value
      if (previousData) {
        queryClient.setQueryData<{ apiKeys: ApiKeySelect[]; projectId: string | null }>(
          apiKeysKeys.lists(),
          {
            ...previousData,
            apiKeys: previousData.apiKeys.filter(apiKey => apiKey.id !== apiKeyId),
          }
        )
      }

      return { previousData }
    },
    onError: (_err, _apiKeyId, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousData) {
        queryClient.setQueryData(apiKeysKeys.lists(), context.previousData)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: apiKeysKeys.lists() })
    },
  })
}

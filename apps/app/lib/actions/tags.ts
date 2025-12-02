"use server"

import { getCurrentUser } from "@/lib/auth-helper"
import { hasProjectAccess, requirePermission } from "@/lib/auth/permissions"
import {
  createTagSchema,
  updateTagSchema,
  type CreateTagInput,
  type UpdateTagInput,
} from "@/lib/validations/tags"
import { Color, prisma } from "@simplist/db"
import { revalidatePath } from "next/cache"
import { forbidden, redirect } from "next/navigation"

export type TagWithMetadata = {
  id: string
  name: string
  icon: string | null
  color: Color | null
  _count: {
    articles: number
  }
  createdAt: Date
  updatedAt: Date
}

/**
 * Get all tags for a project with full metadata (icon, color, article count)
 */
export const getProjectTagsWithMetadata = async (
  projectId: string
): Promise<TagWithMetadata[]> => {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Verify user has access to this project
  const hasAccess = await hasProjectAccess(projectId, user.id)
  if (!hasAccess) {
    forbidden()
  }

  const tags = await prisma.tag.findMany({
    where: {
      projectId,
    },
    select: {
      id: true,
      name: true,
      icon: true,
      color: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          articles: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  })

  return tags
}

/**
 * Create a new tag for a project
 */
export const createTag = async (
  projectId: string,
  input: CreateTagInput
): Promise<{ success: boolean; tag?: TagWithMetadata; error?: string }> => {
  try {
    const user = await getCurrentUser()
    if (!user) {
      redirect("/auth/login")
    }

    // Check if user can manage articles (required for tag management)
    await requirePermission(projectId, "canManageArticles")

    // Validate input
    const validated = createTagSchema.parse(input)

    // Check if tag with same name already exists
    const existingTag = await prisma.tag.findUnique({
      where: {
        projectId_name: {
          projectId,
          name: validated.name,
        },
      },
    })

    if (existingTag) {
      return {
        success: false,
        error: "A tag with this name already exists",
      }
    }

    // Create the tag
    const tag = await prisma.tag.create({
      data: {
        name: validated.name,
        icon: validated.icon,
        color: validated.color,
        projectId,
      },
      select: {
        id: true,
        name: true,
        icon: true,
        color: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            articles: true,
          },
        },
        project: {
          select: {
            slug: true,
          },
        },
      },
    })

    revalidatePath(`/${tag.project.slug}/tags`)
    revalidatePath(`/${tag.project.slug}/articles`)

    return {
      success: true,
      tag,
    }
  } catch (error) {
    console.error("Error creating tag:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create tag",
    }
  }
}

/**
 * Update an existing tag (name, icon, or color)
 */
export const updateTag = async (
  tagId: string,
  projectId: string,
  input: UpdateTagInput
): Promise<{ success: boolean; tag?: TagWithMetadata; error?: string }> => {
  try {
    const user = await getCurrentUser()
    if (!user) {
      redirect("/auth/login")
    }

    // Check if user can manage articles
    await requirePermission(projectId, "canManageArticles")

    // Validate input
    const validated = updateTagSchema.parse(input)

    // Check if tag exists and belongs to this project
    const existingTag = await prisma.tag.findFirst({
      where: {
        id: tagId,
        projectId,
      },
    })

    if (!existingTag) {
      return {
        success: false,
        error: "Tag not found",
      }
    }

    // If updating name, check for duplicates
    if (validated.name && validated.name !== existingTag.name) {
      const duplicateTag = await prisma.tag.findUnique({
        where: {
          projectId_name: {
            projectId,
            name: validated.name,
          },
        },
      })

      if (duplicateTag) {
        return {
          success: false,
          error: "A tag with this name already exists",
        }
      }
    }

    // Update the tag
    const tag = await prisma.tag.update({
      where: {
        id: tagId,
      },
      data: {
        ...(validated.name && { name: validated.name }),
        ...(validated.icon !== undefined && { icon: validated.icon }),
        ...(validated.color !== undefined && { color: validated.color }),
      },
      select: {
        id: true,
        name: true,
        icon: true,
        color: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            articles: true,
          },
        },
        project: {
          select: {
            slug: true,
          },
        },
      },
    })

    revalidatePath(`/${tag.project.slug}/tags`)
    revalidatePath(`/${tag.project.slug}/articles`)

    return {
      success: true,
      tag,
    }
  } catch (error) {
    console.error("Error updating tag:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update tag",
    }
  }
}

/**
 * Delete a tag
 * If the tag is used in articles, it will be removed from those articles
 */
export const deleteTag = async (
  tagId: string,
  projectId: string
): Promise<{ success: boolean; error?: string; articlesAffected?: number }> => {
  try {
    const user = await getCurrentUser()
    if (!user) {
      redirect("/auth/login")
    }

    // Check if user can manage articles
    await requirePermission(projectId, "canManageArticles")

    // Check if tag exists and belongs to this project
    const tag = await prisma.tag.findFirst({
      where: {
        id: tagId,
        projectId,
      },
      select: {
        id: true,
        _count: {
          select: {
            articles: true,
          },
        },
      },
    })

    if (!tag) {
      return {
        success: false,
        error: "Tag not found",
      }
    }

    // Delete the tag (cascade will remove associations with articles)
    const deletedTag = await prisma.tag.delete({
      where: {
        id: tagId,
      },
      select: {
        _count: {
          select: {
            articles: true,
          },
        },
        project: {
          select: {
            slug: true,
          },
        },
      },
    })

    revalidatePath(`/${deletedTag.project.slug}/tags`)
    revalidatePath(`/${deletedTag.project.slug}/articles`)

    return {
      success: true,
      articlesAffected: deletedTag._count.articles,
    }
  } catch (error) {
    console.error("Error deleting tag:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete tag",
    }
  }
}

/**
 * Update tag icon/color from article form
 * This is used when user modifies tag appearance while editing an article
 */
export const updateTagAppearance = async (
  tagName: string,
  projectId: string,
  icon?: string,
  color?: Color
): Promise<{ success: boolean; error?: string }> => {
  try {
    const user = await getCurrentUser()
    if (!user) {
      redirect("/auth/login")
    }

    // Check if user can manage articles
    await requirePermission(projectId, "canManageArticles")

    // Find the tag by name and project
    const tag = await prisma.tag.findUnique({
      where: {
        projectId_name: {
          projectId,
          name: tagName,
        },
      },
      select: {
        id: true,
        project: {
          select: {
            slug: true,
          },
        },
      },
    })

    if (!tag) {
      return {
        success: false,
        error: "Tag not found",
      }
    }

    // Update icon and/or color
    await prisma.tag.update({
      where: {
        id: tag.id,
      },
      data: {
        ...(icon !== undefined && { icon }),
        ...(color !== undefined && { color }),
      },
    })
    const projectSlug = tag.project.slug

    revalidatePath(`/${projectSlug}/tags`)
    revalidatePath(`/${projectSlug}/articles`)

    return {
      success: true,
    }
  } catch (error) {
    console.error("Error updating tag appearance:", error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update tag appearance",
    }
  }
}

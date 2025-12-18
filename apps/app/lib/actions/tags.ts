"use server";

import { getCurrentUser } from "@/lib/auth-helper";
import { hasProjectAccess, requirePermission } from "@/lib/auth/permissions";
import { generateSlug } from "@/lib/utils";
import {
  createTagSchema,
  updateTagSchema,
  type CreateTagInput,
  type UpdateTagInput,
} from "@/lib/validations/tags";
import { Color, prisma } from "@simplist/db";
import { revalidatePath } from "next/cache";
import { forbidden, redirect } from "next/navigation";

export type TagWithMetadata = {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  icon: string | null;
  color: Color | null;
  _count: {
    articles: number;
  };
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Get all tags for a project with full metadata (icon, color, article count)
 */
export const getProjectTagsWithMetadata = async (
  projectId: string,
): Promise<TagWithMetadata[]> => {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth/login");
  }

  // Verify user has access to this project
  const hasAccess = await hasProjectAccess(projectId, user.id);
  if (!hasAccess) {
    forbidden();
  }

  const tags = await prisma.tag.findMany({
    where: {
      projectId,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
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
  });

  return tags;
};

/**
 * Create a new tag for a project
 */
export const createTag = async (
  projectId: string,
  input: CreateTagInput,
): Promise<{ success: boolean; tag?: TagWithMetadata; error?: string }> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      redirect("/auth/login");
    }

    // Check if user can manage tags
    await requirePermission(projectId, "canManageTags");

    // Validate input
    const validated = createTagSchema.parse(input);

    // Check if tag with same name already exists
    const existingTag = await prisma.tag.findUnique({
      where: {
        projectId_name: {
          projectId,
          name: validated.name,
        },
      },
    });

    if (existingTag) {
      return {
        success: false,
        error: "A tag with this name already exists",
      };
    }

    // Generate slug from name
    const slug = generateSlug(validated.name);

    // Check if slug already exists
    const existingSlug = await prisma.tag.findUnique({
      where: {
        projectId_slug: {
          projectId,
          slug,
        },
      },
    });

    if (existingSlug) {
      return {
        success: false,
        error: "A tag with this slug already exists",
      };
    }

    // Create the tag
    const tag = await prisma.tag.create({
      data: {
        name: validated.name,
        slug,
        description: validated.description,
        icon: validated.icon,
        color: validated.color,
        projectId,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
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
    });

    revalidatePath(`/${tag.project.slug}/tags`);
    revalidatePath(`/${tag.project.slug}/articles`);

    return {
      success: true,
      tag,
    };
  } catch (error) {
    console.error("Error creating tag:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create tag",
    };
  }
};

/**
 * Update an existing tag (name, icon, or color)
 */
export const updateTag = async (
  tagId: string,
  projectId: string,
  input: UpdateTagInput,
): Promise<{ success: boolean; tag?: TagWithMetadata; error?: string }> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      redirect("/auth/login");
    }

    // Check if user can manage tags
    await requirePermission(projectId, "canManageTags");

    // Validate input
    const validated = updateTagSchema.parse(input);

    // Check if tag exists and belongs to this project
    const existingTag = await prisma.tag.findFirst({
      where: {
        id: tagId,
        projectId,
      },
    });

    if (!existingTag) {
      return {
        success: false,
        error: "Tag not found",
      };
    }

    // If updating name, check for duplicates and regenerate slug
    let newSlug: string | undefined;
    if (validated.name && validated.name !== existingTag.name) {
      const duplicateTag = await prisma.tag.findUnique({
        where: {
          projectId_name: {
            projectId,
            name: validated.name,
          },
        },
      });

      if (duplicateTag) {
        return {
          success: false,
          error: "A tag with this name already exists",
        };
      }

      // Regenerate slug from new name
      newSlug = generateSlug(validated.name);

      // Check if new slug already exists
      const existingSlug = await prisma.tag.findFirst({
        where: {
          projectId,
          slug: newSlug,
          id: { not: tagId },
        },
      });

      if (existingSlug) {
        return {
          success: false,
          error: "A tag with this slug already exists",
        };
      }
    }

    // Update the tag
    const tag = await prisma.tag.update({
      where: {
        id: tagId,
      },
      data: {
        ...(validated.name && { name: validated.name }),
        ...(newSlug && { slug: newSlug }),
        ...(validated.description !== undefined && {
          description: validated.description,
        }),
        ...(validated.icon !== undefined && { icon: validated.icon }),
        ...(validated.color !== undefined && { color: validated.color }),
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
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
    });

    revalidatePath(`/${tag.project.slug}/tags`);
    revalidatePath(`/${tag.project.slug}/articles`);

    return {
      success: true,
      tag,
    };
  } catch (error) {
    console.error("Error updating tag:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update tag",
    };
  }
};

/**
 * Delete a tag
 * If the tag is used in articles, it will be removed from those articles
 */
export const deleteTag = async (
  tagId: string,
  projectId: string,
): Promise<{ success: boolean; error?: string; articlesAffected?: number }> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      redirect("/auth/login");
    }

    // Check if user can manage tags
    await requirePermission(projectId, "canManageTags");

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
    });

    if (!tag) {
      return {
        success: false,
        error: "Tag not found",
      };
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
    });

    revalidatePath(`/${deletedTag.project.slug}/tags`);
    revalidatePath(`/${deletedTag.project.slug}/articles`);

    return {
      success: true,
      articlesAffected: deletedTag._count.articles,
    };
  } catch (error) {
    console.error("Error deleting tag:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete tag",
    };
  }
};

/**
 * Delete multiple tags at once (bulk delete)
 */
export const bulkDeleteTags = async (
  tagIds: string[],
  projectId: string,
): Promise<{ success: boolean; deletedCount: number; error?: string }> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      redirect("/auth/login");
    }

    // Check if user can manage tags
    await requirePermission(projectId, "canManageTags");

    // Verify all tags belong to this project
    const tags = await prisma.tag.findMany({
      where: {
        id: { in: tagIds },
        projectId,
      },
      select: {
        id: true,
        project: {
          select: {
            slug: true,
          },
        },
      },
    });

    if (tags.length === 0) {
      return {
        success: false,
        deletedCount: 0,
        error: "No tags found",
      };
    }

    // Delete all matching tags
    const result = await prisma.tag.deleteMany({
      where: {
        id: { in: tags.map((t) => t.id) },
        projectId,
      },
    });

    const projectSlug = tags[0]?.project.slug;
    if (projectSlug) {
      revalidatePath(`/${projectSlug}/tags`);
      revalidatePath(`/${projectSlug}/articles`);
    }

    return {
      success: true,
      deletedCount: result.count,
    };
  } catch (error) {
    console.error("Error bulk deleting tags:", error);
    return {
      success: false,
      deletedCount: 0,
      error: error instanceof Error ? error.message : "Failed to delete tags",
    };
  }
};

/**
 * Update tag icon/color from article form
 * This is used when user modifies tag appearance while editing an article
 */
export const updateTagAppearance = async (
  tagName: string,
  projectId: string,
  icon?: string,
  color?: Color,
): Promise<{ success: boolean; error?: string }> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      redirect("/auth/login");
    }

    // Check if user can manage tags
    await requirePermission(projectId, "canManageTags");

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
    });

    if (!tag) {
      return {
        success: false,
        error: "Tag not found",
      };
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
    });
    const projectSlug = tag.project.slug;

    revalidatePath(`/${projectSlug}/tags`);
    revalidatePath(`/${projectSlug}/articles`);

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error updating tag appearance:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update tag appearance",
    };
  }
};

export type ArticleForTagAssignment = {
  id: string;
  title: string;
  slug: string;
  status: string;
  hasTag: boolean;
};

/**
 * Get articles for tag assignment dialog
 * Returns all articles with a flag indicating if they already have the tag
 */
export const getArticlesForTagAssignment = async (
  projectId: string,
  tagId: string,
): Promise<ArticleForTagAssignment[]> => {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth/login");
  }

  const hasAccess = await hasProjectAccess(projectId, user.id);
  if (!hasAccess) {
    forbidden();
  }

  const articles = await prisma.article.findMany({
    where: {
      projectId,
      deletedAt: null,
    },
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      tags: {
        where: { id: tagId },
        select: { id: true },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return articles.map((article) => ({
    id: article.id,
    title: article.title || "Untitled",
    slug: article.slug,
    status: article.status,
    hasTag: article.tags.length > 0,
  }));
};

/**
 * Apply a tag to multiple articles
 */
export const applyTagToArticles = async (
  tagId: string,
  projectId: string,
  articleIds: string[],
): Promise<{ success: boolean; error?: string; appliedCount?: number }> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      redirect("/auth/login");
    }

    await requirePermission(projectId, "canManageTags");

    // Verify tag exists and belongs to project
    const tag = await prisma.tag.findFirst({
      where: {
        id: tagId,
        projectId,
      },
      select: {
        id: true,
        project: {
          select: {
            slug: true,
          },
        },
      },
    });

    if (!tag) {
      return {
        success: false,
        error: "Tag not found",
      };
    }

    // Apply tag to all selected articles
    let appliedCount = 0;
    for (const articleId of articleIds) {
      await prisma.article.update({
        where: { id: articleId },
        data: {
          tags: {
            connect: { id: tagId },
          },
        },
      });
      appliedCount++;
    }

    revalidatePath(`/${tag.project.slug}/tags`);
    revalidatePath(`/${tag.project.slug}/articles`);

    return {
      success: true,
      appliedCount,
    };
  } catch (error) {
    console.error("Error applying tag to articles:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to apply tag to articles",
    };
  }
};

/**
 * Remove a tag from multiple articles
 */
export const removeTagFromArticles = async (
  tagId: string,
  projectId: string,
  articleIds: string[],
): Promise<{ success: boolean; error?: string; removedCount?: number }> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      redirect("/auth/login");
    }

    await requirePermission(projectId, "canManageTags");

    // Verify tag exists and belongs to project
    const tag = await prisma.tag.findFirst({
      where: {
        id: tagId,
        projectId,
      },
      select: {
        id: true,
        project: {
          select: {
            slug: true,
          },
        },
      },
    });

    if (!tag) {
      return {
        success: false,
        error: "Tag not found",
      };
    }

    // Remove tag from all selected articles
    let removedCount = 0;
    for (const articleId of articleIds) {
      await prisma.article.update({
        where: { id: articleId },
        data: {
          tags: {
            disconnect: { id: tagId },
          },
        },
      });
      removedCount++;
    }

    revalidatePath(`/${tag.project.slug}/tags`);
    revalidatePath(`/${tag.project.slug}/articles`);

    return {
      success: true,
      removedCount,
    };
  } catch (error) {
    console.error("Error removing tag from articles:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to remove tag from articles",
    };
  }
};

export type ImportTagInput = {
  name: string;
  icon?: string;
  color?: string;
  description?: string;
};

/**
 * Bulk import tags from CSV/JSON/XML
 */
export const bulkImportTags = async (
  projectId: string,
  tags: ImportTagInput[],
): Promise<{ success: boolean; count?: number; error?: string }> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      redirect("/auth/login");
    }

    await requirePermission(projectId, "canManageTags");

    // Get project slug for revalidation
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { slug: true },
    });

    if (!project) {
      return { success: false, error: "Project not found" };
    }

    // Get existing tag names to avoid duplicates
    const existingTags = await prisma.tag.findMany({
      where: { projectId },
      select: { name: true },
    });
    const existingNames = new Set(
      existingTags.map((t) => t.name.toLowerCase()),
    );

    // Filter out duplicates and validate
    const validTags = tags.filter((tag) => {
      if (!tag.name || tag.name.trim() === "") return false;
      if (existingNames.has(tag.name.toLowerCase())) return false;
      return true;
    });

    if (validTags.length === 0) {
      return {
        success: false,
        error: "No valid tags to import (all duplicates or empty names)",
      };
    }

    // Create tags
    let createdCount = 0;
    for (const tag of validTags) {
      const colorValue = tag.color?.toUpperCase() as Color | undefined;
      const isValidColor =
        colorValue && Object.values(Color).includes(colorValue);

      await prisma.tag.create({
        data: {
          name: tag.name.trim(),
          slug: generateSlug(tag.name.trim()),
          icon: tag.icon || null,
          color: isValidColor ? colorValue : null,
          description: tag.description || null,
          projectId,
        },
      });
      createdCount++;
      // Add to existing names to prevent duplicates within the same import
      existingNames.add(tag.name.toLowerCase());
    }

    revalidatePath(`/${project.slug}/tags`);

    return {
      success: true,
      count: createdCount,
    };
  } catch (error) {
    console.error("Error importing tags:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to import tags",
    };
  }
};

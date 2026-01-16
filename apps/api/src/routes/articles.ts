import { parseQuery } from "@/types/fastify";
import type { ArticleBySlugQuery, ArticlesListQuery } from "@/types/requests";
import {
  cacheArticle,
  cacheArticlesList,
  getCachedArticle,
  getCachedArticlesList,
} from "@/utils/article-cache";
import { formatArticle } from "@/utils/format";
import { generateSeoMetadata } from "@/utils/seo-generator";
import * as db from "@simplist/db";
import { FastifyPluginAsync } from "fastify";

const { prisma } = db;

const articlesRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /articles - List articles with pagination
  fastify.get("/articles", async (request, reply) => {
    // Check if key has read permissions
    if (!request.checkPermission!("read")) {
      return reply.code(403).send({
        error: "Forbidden",
        message: "API key does not have read permissions.",
        statusCode: 403,
      });
    }

    const query = parseQuery<ArticlesListQuery>(request);
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    // Validate sort field - allow viewCount for popularity sorting
    const allowedSortFields = [
      "createdAt",
      "updatedAt",
      "title",
      "publishedAt",
      "viewCount",
    ];
    const sort = allowedSortFields.includes(query.sort || "")
      ? query.sort
      : "createdAt";
    const order = query.order || "desc";
    const published =
      query.published !== undefined ? Boolean(query.published) : true;
    const search = query.search;
    const status = query.status;
    const projectId = request.apiKey!.projectId;

    // Parse field selection (select parameter)
    let fieldSelection: Record<string, boolean> | undefined;
    if (query.select) {
      try {
        fieldSelection =
          typeof query.select === "string"
            ? JSON.parse(query.select)
            : query.select;
      } catch (error) {
        return reply.code(400).send({
          error: "Bad Request",
          message: "Invalid select parameter format. Expected JSON object.",
          statusCode: 400,
        });
      }
    }

    // Parse tag filters
    const tags = query.tags
      ? Array.isArray(query.tags)
        ? query.tags
        : query.tags.split(",")
      : undefined;
    const tagsAll = query.tagsAll
      ? Array.isArray(query.tagsAll)
        ? query.tagsAll
        : query.tagsAll.split(",")
      : undefined;
    const excludeTags = query.excludeTags
      ? Array.isArray(query.excludeTags)
        ? query.excludeTags
        : query.excludeTags.split(",")
      : undefined;

    try {
      // Create cache key parameters
      const cacheParams = {
        page,
        limit,
        sort,
        order,
        published,
        search,
        status,
        tags,
        tagsAll,
        excludeTags,
      };

      // Try to get from cache first
      const cachedArticles = await getCachedArticlesList(
        projectId,
        cacheParams,
      );

      if (cachedArticles) {
        fastify.log.info(`Cache hit for articles list (project: ${projectId})`);

        // Format cached articles (converts variants array to object)
        const formattedArticles = cachedArticles.map((article) =>
          formatArticle(article as any, fieldSelection),
        );

        // Calculate pagination meta (we need total count which might not be cached)
        const totalPages = Math.ceil(formattedArticles.length / limit);

        return {
          data: formattedArticles,
          meta: {
            page,
            limit,
            total: formattedArticles.length,
            totalPages,
          },
        };
      }

      fastify.log.info(`Cache miss for articles list (project: ${projectId})`);

      // Build where clause
      const where: Record<string, unknown> = {
        projectId,
        status: { notIn: ["deleted", "scheduled"] }, // Exclude soft-deleted and scheduled articles
      };

      // Filter by published status if specified
      if (published !== undefined) {
        where.published = published;
      }

      // Filter by status if specified
      if (status) {
        where.status = status;
      }

      // Add search filter if provided
      if (search) {
        where.OR = [
          { title: { contains: search, mode: "insensitive" } },
          { excerpt: { contains: search, mode: "insensitive" } },
          { content: { contains: search, mode: "insensitive" } },
        ];
      }

      // Filter by tags (OR logic - at least one tag)
      if (tags && tags.length > 0) {
        where.tags = { some: { name: { in: tags } } };
      }

      // Filter by tagsAll (AND logic - all tags required)
      if (tagsAll && tagsAll.length > 0) {
        where.AND = tagsAll.map((tagName: string) => ({
          tags: { some: { name: tagName } },
        }));
      }

      // Exclude tags
      if (excludeTags && excludeTags.length > 0) {
        if (where.tags) {
          where.tags = { ...where.tags, none: { name: { in: excludeTags } } };
        } else {
          where.tags = { none: { name: { in: excludeTags } } };
        }
      }

      // Get total count for pagination
      const total = await prisma.article.count({ where });

      // Get articles
      const articles = await prisma.article.findMany({
        where,
        include: {
          author: {
            select: {
              name: true,
              firstName: true,
              lastName: true,
              image: true,
            },
          },
          lastUpdatedBy: {
            select: {
              name: true,
              firstName: true,
              lastName: true,
              image: true,
            },
          },
          tags: true,
          variants: true,
          project: true,
        },
        orderBy: { [sort || "createdAt"]: order },
        skip: (page - 1) * limit,
        take: limit,
      });

      const totalPages = Math.ceil(total / limit);
      const formattedArticles = articles.map((article) =>
        formatArticle(article, fieldSelection),
      );

      // Cache the articles list (async, don't wait)
      cacheArticlesList(projectId, cacheParams, articles).catch((err) =>
        fastify.log.error(err, "Failed to cache articles list"),
      );

      return {
        data: formattedArticles,
        meta: {
          page,
          limit,
          total,
          totalPages,
        },
      };
    } catch (error) {
      fastify.log.error(error, "Error fetching articles");
      return reply.code(500).send({
        error: "Internal Server Error",
        message: "Failed to fetch articles",
        statusCode: 500,
      });
    }
  });

  // GET /articles/:slug - Get single article by slug
  fastify.get(
    "/articles/:slug",
    {
      schema: {
        querystring: {
          type: "object",
          properties: {
            includeSeo: { type: "boolean" },
            baseUrl: { type: "string", format: "uri" },
            optionalFields: { type: "string" },
          },
        },
      },
    },
    async (request, reply) => {
      // Check if key has read permissions
      if (!request.checkPermission!("read")) {
        return reply.code(403).send({
          error: "Forbidden",
          message: "API key does not have read permissions.",
          statusCode: 403,
        });
      }

      const { slug } = request.params as { slug: string };
      const query = parseQuery<ArticleBySlugQuery>(request);
      const { includeSeo = false, baseUrl } = query;
      const projectId = request.apiKey!.projectId;

      // Parse field selection (select parameter)
      let fieldSelection: Record<string, boolean> | undefined;
      if (query.select) {
        try {
          fieldSelection =
            typeof query.select === "string"
              ? JSON.parse(query.select)
              : query.select;
        } catch (error) {
          return reply.code(400).send({
            error: "Bad Request",
            message: "Invalid select parameter format. Expected JSON object.",
            statusCode: 400,
          });
        }
      }

      try {
        // Try to get from cache first
        const cachedArticle = await getCachedArticle(projectId, slug);
        if (cachedArticle) {
          fastify.log.info(
            `Cache hit for article ${slug} (project: ${projectId})`,
          );

          let responseData = formatArticle(cachedArticle, fieldSelection);

          // Add SEO metadata if requested
          if (includeSeo) {
            const project = await prisma.project.findUnique({
              where: { id: projectId },
            });
            if (project) {
              const seoMetadata = generateSeoMetadata(
                cachedArticle,
                project,
                baseUrl,
              );
              responseData = { ...responseData, seo: seoMetadata };
            }
          }

          return {
            data: responseData,
          };
        }

        fastify.log.info(
          `Cache miss for article ${slug} (project: ${projectId})`,
        );

        const article = await prisma.article.findFirst({
          where: {
            slug,
            projectId,
            status: { notIn: ["deleted", "scheduled"] },
            published: true, // Only return published articles via public API
          },
          include: {
            variants: true,
            author: {
              select: {
                name: true,
                firstName: true,
                lastName: true,
                image: true,
              },
            },
            lastUpdatedBy: {
              select: {
                name: true,
                firstName: true,
                lastName: true,
                image: true,
              },
            },
            tags: true,
            project: true,
          },
        });

        if (!article) {
          return reply.code(404).send({
            error: "Not Found",
            message: "Article not found or not published",
            statusCode: 404,
          });
        }

        // Cache the article with full content (async, don't wait)
        cacheArticle(projectId, article).catch((err) =>
          fastify.log.error(err, "Failed to cache article"),
        );

        let responseData = formatArticle(article, fieldSelection);

        // Add SEO metadata if requested
        if (includeSeo && "project" in article && article.project) {
          const seoMetadata = generateSeoMetadata(
            article,
            article.project,
            baseUrl,
          );
          responseData = { ...responseData, seo: seoMetadata };
        }

        return {
          data: responseData,
        };
      } catch (error) {
        fastify.log.error(error, "Error fetching article");
        return reply.code(500).send({
          error: "Internal Server Error",
          message: "Failed to fetch article",
          statusCode: 500,
        });
      }
    },
  );
};

export default articlesRoutes;

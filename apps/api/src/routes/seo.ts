import * as db from "@simplist/db";
import { getRedis } from "@simplist/db";
import { FastifyPluginAsync } from "fastify";
import { type SitemapEntry } from "../schemas/seo";
import {
  generateRSSFeed,
  generateSeoMetadata,
  generateSitemap,
} from "../utils/seo-generator";

const { prisma } = db;
const redis = getRedis();

const SEO_CACHE_TTL = 5 * 60;

const buildSitemapCacheKey = (
  projectId: string,
  baseUrl: string,
  format: "xml" | "json",
  lang?: string,
  customPath?: string,
) => {
  return `seo:sitemap:${projectId}:${format}:${lang || ""}:${customPath || ""}:${baseUrl}`;
};

const buildRssCacheKey = (
  projectId: string,
  baseUrl: string,
  limit: number,
  lang?: string,
  customPath?: string,
) => {
  return `seo:rss:${projectId}:${limit}:${lang || ""}:${customPath || ""}:${baseUrl}`;
};

const buildStructuredDataCacheKey = (
  projectId: string,
  baseUrl?: string,
  limit?: number,
  offset?: number,
) => {
  return `seo:structured:${projectId}:${baseUrl || ""}:${limit || 0}:${offset || 0}`;
};

const seoRoutes: FastifyPluginAsync = async (fastify) => {
  // Get SEO metadata for a specific article
  fastify.get(
    "/seo/article/:articleSlug",
    {
      schema: {
        params: {
          type: "object",
          properties: {
            articleSlug: { type: "string" },
          },
          required: ["articleSlug"],
        },
        querystring: {
          type: "object",
          properties: {
            baseUrl: { type: "string", format: "uri" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              id: { type: "string" },
              title: { type: "string" },
              slug: { type: "string" },
              excerpt: { type: ["string", "null"] },
              content: { type: "string" },
              coverImage: { type: ["string", "null"] },
              published: { type: "boolean" },
              viewCount: { type: "number" },
              wordCount: { type: "number" },
              characterCount: { type: "number" },
              lineCount: { type: "number" },
              readTimeMinutes: { type: "number" },
              createdAt: { type: "string" },
              updatedAt: { type: "string" },
              publishedAt: { type: ["string", "null"] },
              seo: { type: "object" },
              project: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  slug: { type: "string" },
                },
                required: ["name", "slug"],
              },
            },
            required: [
              "id",
              "title",
              "slug",
              "content",
              "published",
              "viewCount",
              "wordCount",
              "characterCount",
              "lineCount",
              "readTimeMinutes",
              "createdAt",
              "updatedAt",
              "seo",
              "project",
            ],
          },
        },
      },
    },
    async (request, reply) => {
      const { articleSlug } = request.params as { articleSlug: string };
      const { baseUrl } = request.query as { baseUrl?: string };

      if (!request.apiKey) {
        return reply.status(401 as any).send({ error: "API key required" });
      }

      // Check if key has read permissions
      if (!request.checkPermission!("read")) {
        return reply.status(403 as any).send({
          error: "Forbidden",
          message: "API key does not have read permissions.",
          statusCode: 403,
        });
      }

      try {
        // Get project from API key (no need for projectSlug parameter)
        const project = await prisma.project.findUnique({
          where: { id: request.apiKey.projectId },
        });

        if (!project) {
          return reply.status(404 as any).send({ error: "Project not found" });
        }

        // Find the article
        const article = await prisma.article.findFirst({
          where: {
            slug: articleSlug,
            projectId: project.id,
            published: true,
            status: "published",
          },
        });

        if (!article) {
          return reply.status(404 as any).send({ error: "Article not found" });
        }

        // Generate SEO metadata
        const seoMetadata = generateSeoMetadata(article, project, baseUrl);

        const response = {
          ...article,
          createdAt: article.createdAt.toISOString(),
          updatedAt: article.updatedAt.toISOString(),
          publishedAt: article.publishedAt?.toISOString() || null,
          seo: seoMetadata,
          project: {
            name: project.name,
            slug: project.slug,
          },
        };

        return reply.send(response);
      } catch (error) {
        fastify.log.error(error, "Failed to get article SEO metadata");
        return reply
          .status(500 as any)
          .send({ error: "Internal server error" });
      }
    },
  );

  // Get SEO metadata for a specific article variant
  fastify.get(
    "/seo/article/:articleSlug/:lang",
    {
      schema: {
        params: {
          type: "object",
          properties: {
            articleSlug: { type: "string" },
            lang: { type: "string" },
          },
          required: ["articleSlug", "lang"],
        },
        querystring: {
          type: "object",
          properties: {
            baseUrl: { type: "string", format: "uri" },
          },
        },
      },
    },
    async (request, reply) => {
      const { articleSlug, lang } = request.params as {
        articleSlug: string;
        lang: string;
      };
      const { baseUrl } = request.query as { baseUrl?: string };

      if (!request.apiKey) {
        return reply.status(401 as any).send({ error: "API key required" });
      }

      // Check if key has read permissions
      if (!request.checkPermission!("read")) {
        return reply.status(403 as any).send({
          error: "Forbidden",
          message: "API key does not have read permissions.",
          statusCode: 403,
        });
      }

      try {
        // Get project from API key
        const project = await prisma.project.findUnique({
          where: { id: request.apiKey.projectId },
        });

        if (!project) {
          return reply.status(404 as any).send({ error: "Project not found" });
        }

        // Find the article with variants
        const article = await prisma.article.findFirst({
          where: {
            slug: articleSlug,
            projectId: project.id,
            published: true,
            status: "published",
          },
          include: {
            variants: true,
          },
        });

        if (!article) {
          return reply.status(404 as any).send({ error: "Article not found" });
        }

        // Check if variant exists
        if (
          !article.variants ||
          !article.variants.some((v) => v.lang === lang)
        ) {
          return reply.status(404 as any).send({ error: "Variant not found" });
        }

        // Generate SEO metadata for the specific variant
        const seoMetadata = generateSeoMetadata(
          article,
          project,
          baseUrl,
          lang,
        );

        const response = {
          ...article,
          createdAt: article.createdAt.toISOString(),
          updatedAt: article.updatedAt.toISOString(),
          publishedAt: article.publishedAt?.toISOString() || null,
          seo: seoMetadata,
          project: {
            name: project.name,
            slug: project.slug,
          },
        };

        return reply.send(response);
      } catch (error) {
        fastify.log.error(error, "Failed to get article variant SEO metadata");
        return reply
          .status(500 as any)
          .send({ error: "Internal server error" });
      }
    },
  );

  // Get sitemap for a project
  fastify.get(
    "/seo/sitemap",
    {
      schema: {
        querystring: {
          type: "object",
          properties: {
            baseUrl: { type: "string", format: "uri" },
            format: { type: "string", enum: ["xml", "json"] },
            lang: { type: "string" },
            customPath: { type: "string" },
          },
          required: ["baseUrl"],
        },
      },
    },
    async (request, reply) => {
      const {
        baseUrl,
        format = "xml",
        lang,
        customPath,
      } = request.query as {
        baseUrl: string;
        format?: "xml" | "json";
        lang?: string;
        customPath?: string;
      };
      const projectId = request.apiKey?.projectId;

      if (!request.apiKey) {
        return reply.status(401 as any).send({ error: "API key required" });
      }

      // Check if key has read permissions
      if (!request.checkPermission!("read")) {
        return reply.status(403 as any).send({
          error: "Forbidden",
          message: "API key does not have read permissions.",
          statusCode: 403,
        });
      }

      try {
        // Try cache first
        if (redis && projectId) {
          const cacheKey = buildSitemapCacheKey(
            projectId,
            baseUrl,
            format,
            lang,
            customPath,
          );
          const cached = await redis.get(cacheKey);
          if (cached) {
            fastify.log.debug(`SEO sitemap cache hit for project ${projectId}`);
            if (format === "xml") {
              reply.type("application/xml");
              return reply.send(cached);
            }
            return reply.send(
              JSON.parse(
                typeof cached === "string" ? cached : JSON.stringify(cached),
              ),
            );
          }
        }

        // Get project from API key
        const project = await prisma.project.findUnique({
          where: { id: request.apiKey.projectId },
        });

        if (!project) {
          return reply.status(404 as any).send({ error: "Project not found" });
        }

        // Get published articles with variants
        const articles = await prisma.article.findMany({
          where: {
            projectId: project.id,
            published: true,
            status: "published",
          },
          include: {
            variants: true,
          },
          orderBy: {
            updatedAt: "desc",
          },
        });

        if (format === "xml") {
          const sitemap = generateSitemap(
            articles,
            project,
            baseUrl,
            lang,
            customPath,
          );
          if (redis && projectId) {
            const cacheKey = buildSitemapCacheKey(
              projectId,
              baseUrl,
              format,
              lang,
              customPath,
            );
            redis
              .setex(
                cacheKey,
                SEO_CACHE_TTL,
                typeof sitemap === "string" ? sitemap : JSON.stringify(sitemap),
              )
              .catch(() => {});
          }
          reply.type("application/xml");
          return reply.send(sitemap);
        } else {
          const articlePath = customPath || `${project.slug}/{slug}`;
          const projectPath = customPath
            ? customPath.replace(/\/[^\/]+$/, "")
            : project.slug;

          const entries: SitemapEntry[] = articles.map((article) => ({
            url: `${baseUrl}/${articlePath.replace("{slug}", article.slug)}`,
            lastModified: article.updatedAt.toISOString(),
            changeFrequency: "weekly" as const,
            priority: 0.8,
          }));

          // Add project index if no custom path or if custom path allows it
          if (!customPath || customPath.includes("{slug}")) {
            entries.unshift({
              url: `${baseUrl}/${projectPath}`,
              lastModified: new Date().toISOString(),
              changeFrequency: "daily" as const,
              priority: 1.0,
            });
          }

          const response = {
            entries,
            generatedAt: new Date().toISOString(),
          };

          if (redis && projectId) {
            const cacheKey = buildSitemapCacheKey(
              projectId,
              baseUrl,
              format,
              lang,
              customPath,
            );
            redis
              .setex(cacheKey, SEO_CACHE_TTL, JSON.stringify(response))
              .catch(() => {});
          }

          return reply.send(response);
        }
      } catch (error) {
        fastify.log.error(error, "Failed to generate sitemap");
        return reply
          .status(500 as any)
          .send({ error: "Internal server error" });
      }
    },
  );

  // Get RSS feed for a project
  fastify.get(
    "/seo/rss",
    {
      schema: {
        querystring: {
          type: "object",
          properties: {
            baseUrl: { type: "string", format: "uri" },
            limit: { type: "number", minimum: 1, maximum: 100 },
            lang: { type: "string" },
            customPath: { type: "string" },
          },
          required: ["baseUrl"],
        },
      },
    },
    async (request, reply) => {
      const {
        baseUrl,
        limit = 20,
        lang,
        customPath,
      } = request.query as {
        baseUrl: string;
        limit?: number;
        lang?: string;
        customPath?: string;
      };
      const projectId = request.apiKey?.projectId;

      if (!request.apiKey) {
        return reply.status(401 as any).send({ error: "API key required" });
      }

      // Check if key has read permissions
      if (!request.checkPermission!("read")) {
        return reply.status(403 as any).send({
          error: "Forbidden",
          message: "API key does not have read permissions.",
          statusCode: 403,
        });
      }

      try {
        // Try cache first
        if (redis && projectId) {
          const cacheKey = buildRssCacheKey(
            projectId,
            baseUrl,
            limit,
            lang,
            customPath,
          );
          const cached = await redis.get(cacheKey);
          if (cached) {
            fastify.log.debug(`SEO RSS cache hit for project ${projectId}`);
            reply.type("application/rss+xml");
            return reply.send(
              typeof cached === "string" ? cached : JSON.stringify(cached),
            );
          }
        }

        // Get project from API key
        const project = await prisma.project.findUnique({
          where: { id: request.apiKey.projectId },
        });

        if (!project) {
          return reply.status(404 as any).send({ error: "Project not found" });
        }

        // Get published articles with variants
        const articles = await prisma.article.findMany({
          where: {
            projectId: project.id,
            published: true,
            status: "published",
          },
          include: {
            variants: true,
          },
          orderBy: {
            publishedAt: "desc",
          },
          take: limit,
        });

        const rss = generateRSSFeed(
          articles,
          project,
          baseUrl,
          lang,
          customPath,
        );

        reply.type("application/rss+xml");
        if (redis && projectId) {
          const cacheKey = buildRssCacheKey(
            projectId,
            baseUrl,
            limit,
            lang,
            customPath,
          );
          redis
            .setex(
              cacheKey,
              SEO_CACHE_TTL,
              typeof rss === "string" ? rss : JSON.stringify(rss),
            )
            .catch(() => {});
        }
        return reply.send(rss);
      } catch (error) {
        fastify.log.error(error, "Failed to generate RSS feed");
        return reply
          .status(500 as any)
          .send({ error: "Internal server error" });
      }
    },
  );

  // Get structured data for all articles in a project
  fastify.get(
    "/seo/structured-data",
    {
      schema: {
        querystring: {
          type: "object",
          properties: {
            baseUrl: { type: "string", format: "uri" },
            limit: { type: "number", minimum: 1, maximum: 500 },
            offset: { type: "number", minimum: 0 },
          },
        },
      },
    },
    async (request, reply) => {
      const {
        baseUrl,
        limit = 200,
        offset = 0,
      } = request.query as {
        baseUrl?: string;
        limit?: number;
        offset?: number;
      };
      const projectId = request.apiKey?.projectId;

      if (!request.apiKey) {
        return reply.status(401 as any).send({ error: "API key required" });
      }

      // Check if key has read permissions
      if (!request.checkPermission!("read")) {
        return reply.status(403 as any).send({
          error: "Forbidden",
          message: "API key does not have read permissions.",
          statusCode: 403,
        });
      }

      try {
        // Try cache first
        if (redis && projectId) {
          const cacheKey = buildStructuredDataCacheKey(
            projectId,
            baseUrl,
            limit,
            offset,
          );
          const cached = await redis.get(cacheKey);
          if (cached) {
            fastify.log.debug(
              `SEO structured-data cache hit for project ${projectId}`,
            );
            return reply.send(
              JSON.parse(
                typeof cached === "string" ? cached : JSON.stringify(cached),
              ),
            );
          }
        }

        // Get project from API key
        const project = await prisma.project.findUnique({
          where: { id: request.apiKey.projectId },
        });

        if (!project) {
          return reply.status(404 as any).send({ error: "Project not found" });
        }

        // Get published articles (paginés pour éviter de charger des milliers d'entrées d'un coup)
        const articles = await prisma.article.findMany({
          where: {
            projectId: project.id,
            published: true,
            status: "published",
          },
          orderBy: {
            publishedAt: "desc",
          },
          skip: offset,
          take: limit,
        });

        const structuredData = articles.map((article) => {
          const seoMetadata = generateSeoMetadata(article, project, baseUrl);
          return {
            slug: article.slug,
            structuredData: seoMetadata.structuredData,
          };
        });

        const responsePayload = {
          project: {
            name: project.name,
            slug: project.slug,
          },
          articles: structuredData,
          generatedAt: new Date().toISOString(),
        };

        if (redis && projectId) {
          const cacheKey = buildStructuredDataCacheKey(
            projectId,
            baseUrl,
            limit,
            offset,
          );
          redis
            .setex(cacheKey, SEO_CACHE_TTL, JSON.stringify(responsePayload))
            .catch(() => {});
        }

        return reply.send(responsePayload);
      } catch (error) {
        fastify.log.error(error, "Failed to get structured data");
        return reply
          .status(500 as any)
          .send({ error: "Internal server error" });
      }
    },
  );
};

export default seoRoutes;
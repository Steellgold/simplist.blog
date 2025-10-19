import * as db from '@simplist/db'
import { FastifyPluginAsync } from 'fastify'
import {
  cacheArticle,
  cacheArticlesList,
  getCachedArticle,
  getCachedArticlesList
} from '../utils/article-cache'
import { formatArticle } from '../utils/format'
import { generateSeoMetadata } from '../utils/seo-generator'

const { prisma } = db

const articlesRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /articles - List articles with pagination
  fastify.get('/articles', async (request, reply) => {
    const query = request.query as any
    const page = Number(query.page) || 1
    const limit = Number(query.limit) || 20
    const sort = query.sort || 'createdAt'
    const order = query.order || 'desc'
    const published = query.published !== undefined ? Boolean(query.published) : true
    const search = query.search
    const status = query.status
    const projectId = request.apiKey!.projectId

    try {
      // Create cache key parameters
      const cacheParams = { page, limit, sort, order, published, search, status }
      
      // Try to get from cache first
      const cachedArticles = await getCachedArticlesList(projectId, cacheParams)
      if (cachedArticles) {
        fastify.log.info(`Cache hit for articles list (project: ${projectId})`)
        
        // Calculate pagination meta (we need total count which might not be cached)
        const totalPages = Math.ceil(cachedArticles.length / limit)
        
        return {
          data: cachedArticles,
          meta: {
            page,
            limit,
            total: cachedArticles.length,
            totalPages
          }
        }
      }

      fastify.log.info(`Cache miss for articles list (project: ${projectId})`)

      // Build where clause
      const where: any = {
        projectId,
        status: { not: 'deleted' } // Exclude soft-deleted articles
      }

      // Filter by published status if specified
      if (published !== undefined) {
        where.published = published
      }

      // Filter by status if specified
      if (status) {
        where.status = status
      }

      // Add search filter if provided
      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { excerpt: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } }
        ]
      }

      // Get total count for pagination
      const total = await prisma.article.count({ where })

      // Get articles
      const articles = await prisma.article.findMany({
        where,
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          coverImage: true,
          published: true,
          status: true,
          viewCount: true,
          wordCount: true,
          characterCount: true,
          lineCount: true,
          readTimeMinutes: true,
          createdAt: true,
          updatedAt: true,
          publishedAt: true
        },
        orderBy: { [sort]: order },
        skip: (page - 1) * limit,
        take: limit
      })

      const totalPages = Math.ceil(total / limit)
      const formattedArticles = articles.map(formatArticle)

      // Cache the articles list (async, don't wait)
      cacheArticlesList(projectId, cacheParams, formattedArticles).catch(err => 
        fastify.log.error(err, 'Failed to cache articles list')
      )

      return {
        data: formattedArticles,
        meta: {
          page,
          limit,
          total,
          totalPages
        }
      }
    } catch (error) {
      fastify.log.error(error, 'Error fetching articles')
      return reply.status(500 as any).send({
        error: 'Internal Server Error',
        message: 'Failed to fetch articles',
        statusCode: 500
      })
    }
  })

  // GET /articles/:slug - Get single article by slug
  fastify.get('/articles/:slug', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          includeSeo: { type: 'boolean' },
          baseUrl: { type: 'string', format: 'uri' }
        }
      }
    }
  }, async (request, reply) => {
    const { slug } = request.params as { slug: string }
    const { includeSeo = false, baseUrl } = request.query as { includeSeo?: boolean, baseUrl?: string }
    const projectId = request.apiKey!.projectId

    try {
      // Try to get from cache first
      const cachedArticle = await getCachedArticle(projectId, slug)
      if (cachedArticle) {
        fastify.log.info(`Cache hit for article ${slug} (project: ${projectId})`)

        let responseData = formatArticle(cachedArticle)

        // Add SEO metadata if requested
        if (includeSeo) {
          const project = await prisma.project.findUnique({
            where: { id: projectId }
          })
          if (project) {
            const seoMetadata = generateSeoMetadata(cachedArticle, project, baseUrl)
            responseData = { ...responseData, seo: seoMetadata }
          }
        }

        return {
          data: responseData
        }
      }

      fastify.log.info(`Cache miss for article ${slug} (project: ${projectId})`)

      const article = await prisma.article.findFirst({
        where: {
          slug,
          projectId,
          status: { not: 'deleted' },
          published: true // Only return published articles via public API
        },
        include: includeSeo ? {
          project: true
        } : undefined
      })

      if (!article) {
        return reply.status(404 as any).send({
          error: 'Not Found',
          message: 'Article not found or not published',
          statusCode: 404
        })
      }

      // Cache the article with full content (async, don't wait)
      cacheArticle(projectId, article).catch(err => 
        fastify.log.error(err, 'Failed to cache article')
      )

      // Note: Do not increment view count on read to avoid inflating metrics

      let responseData = formatArticle(article)

      // Add SEO metadata if requested
      if (includeSeo && 'project' in article && article.project) {
        const seoMetadata = generateSeoMetadata(article, article.project, baseUrl)
        responseData = { ...responseData, seo: seoMetadata }
      }

      return {
        data: responseData
      }
    } catch (error) {
      fastify.log.error(error, 'Error fetching article')
      return reply.status(500 as any).send({
        error: 'Internal Server Error',
        message: 'Failed to fetch article',
        statusCode: 500
      })
    }
  })
}

export default articlesRoutes
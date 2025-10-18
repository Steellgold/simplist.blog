import { FastifyPluginAsync } from 'fastify'
import * as db from '@simplist/db'

const { prisma } = db
import { 
  articleListQuerySchema, 
  articleListResponseSchema,
  articleResponseSchema,
  type ArticleListQuery 
} from '../schemas/article'
import { errorResponseSchema } from '../schemas/common'
import { formatArticle } from '../utils/format'

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

      return {
        data: articles.map(formatArticle),
        meta: {
          page,
          limit,
          total,
          totalPages
        }
      }
    } catch (error) {
      fastify.log.error(error, 'Error fetching articles')
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Failed to fetch articles',
        statusCode: 500
      })
    }
  })

  // GET /articles/:slug - Get single article by slug
  fastify.get('/articles/:slug', async (request, reply) => {
    const { slug } = request.params as { slug: string }
    const projectId = request.apiKey!.projectId

    try {
      const article = await prisma.article.findFirst({
        where: {
          slug,
          projectId,
          status: { not: 'deleted' },
          published: true // Only return published articles via public API
        }
      })

      if (!article) {
        return reply.code(404).send({
          error: 'Not Found',
          message: 'Article not found or not published',
          statusCode: 404
        })
      }

      // Increment view count (fire and forget)
      prisma.article.update({
        where: { id: article.id },
        data: { viewCount: { increment: 1 } }
      }).catch(() => {
        // Ignore errors for view count
      })

      return {
        data: formatArticle(article)
      }
    } catch (error) {
      fastify.log.error(error, 'Error fetching article')
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Failed to fetch article',
        statusCode: 500
      })
    }
  })
}

export default articlesRoutes
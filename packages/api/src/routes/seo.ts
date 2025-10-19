import * as db from '@simplist/db'
import { FastifyPluginAsync } from 'fastify'
import { articleSeoSchema, type SitemapEntry } from '../schemas/seo'
import { generateRSSFeed, generateSeoMetadata, generateSitemap } from '../utils/seo-generator'

const { prisma } = db

const seoRoutes: FastifyPluginAsync = async (fastify) => {
  // Get SEO metadata for a specific article
  fastify.get('/seo/article/:articleSlug', {
    schema: {
      params: {
        type: 'object',
        properties: {
          articleSlug: { type: 'string' }
        },
        required: ['articleSlug']
      },
      querystring: {
        type: 'object',
        properties: {
          baseUrl: { type: 'string', format: 'uri' }
        }
      },
      response: {
        200: articleSeoSchema
      }
    }
  }, async (request, reply) => {
    const { articleSlug } = request.params as { articleSlug: string }
    const { baseUrl } = request.query as { baseUrl?: string }

    if (!request.apiKey) {
      return reply.status(401 as any).send({ error: 'API key required' })
    }

    try {
      // Get project from API key (no need for projectSlug parameter)
      const project = await prisma.project.findUnique({
        where: { id: request.apiKey.projectId }
      })

      if (!project) {
        return reply.status(404 as any).send({ error: 'Project not found' })
      }

      // Find the article
      const article = await prisma.article.findFirst({
        where: {
          slug: articleSlug,
          projectId: project.id,
          published: true,
          status: 'published'
        }
      })

      if (!article) {
        return reply.status(404 as any).send({ error: 'Article not found' })
      }

      // Generate SEO metadata
      const seoMetadata = generateSeoMetadata(article, project, baseUrl)

      const response = {
        ...article,
        createdAt: article.createdAt.toISOString(),
        updatedAt: article.updatedAt.toISOString(),
        publishedAt: article.publishedAt?.toISOString() || null,
        seo: seoMetadata,
        project: {
          name: project.name,
          slug: project.slug,
          description: project.description
        }
      }

      return reply.send(response)
    } catch (error) {
      fastify.log.error(error, 'Failed to get article SEO metadata')
      return reply.status(500 as any).send({ error: 'Internal server error' })
    }
  })

  // Get sitemap for a project  
  fastify.get('/seo/sitemap', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          baseUrl: { type: 'string', format: 'uri' },
          format: { type: 'string', enum: ['xml', 'json'] }
        },
        required: ['baseUrl']
      }
    }
  }, async (request, reply) => {
    const { baseUrl, format = 'xml' } = request.query as { baseUrl: string, format?: 'xml' | 'json' }

    if (!request.apiKey) {
      return reply.status(401 as any).send({ error: 'API key required' })
    }

    try {
      // Get project from API key
      const project = await prisma.project.findUnique({
        where: { id: request.apiKey.projectId }
      })

      if (!project) {
        return reply.status(404 as any).send({ error: 'Project not found' })
      }

      // Get published articles
      const articles = await prisma.article.findMany({
        where: {
          projectId: project.id,
          published: true,
          status: 'published'
        },
        orderBy: {
          updatedAt: 'desc'
        }
      })

      if (format === 'xml') {
        const sitemap = generateSitemap(articles, project, baseUrl)
        reply.type('application/xml')
        return reply.send(sitemap)
      } else {
        const entries: SitemapEntry[] = articles.map(article => ({
          url: `${baseUrl}/${project.slug}/${article.slug}`,
          lastModified: article.updatedAt.toISOString(),
          changeFrequency: 'weekly' as const,
          priority: 0.8
        }))

        // Add project index
        entries.unshift({
          url: `${baseUrl}/${project.slug}`,
          lastModified: new Date().toISOString(),
          changeFrequency: 'daily' as const,
          priority: 1.0
        })

        const response = {
          entries,
          generatedAt: new Date().toISOString()
        }

        return reply.send(response)
      }
    } catch (error) {
      fastify.log.error(error, 'Failed to generate sitemap')
      return reply.status(500 as any).send({ error: 'Internal server error' })
    }
  })

  // Get RSS feed for a project
  fastify.get('/seo/rss', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          baseUrl: { type: 'string', format: 'uri' },
          limit: { type: 'number', minimum: 1, maximum: 100 }
        },
        required: ['baseUrl']
      }
    }
  }, async (request, reply) => {
    const { baseUrl, limit = 20 } = request.query as { baseUrl: string, limit?: number }

    if (!request.apiKey) {
      return reply.status(401 as any).send({ error: 'API key required' })
    }

    try {
      // Get project from API key
      const project = await prisma.project.findUnique({
        where: { id: request.apiKey.projectId }
      })

      if (!project) {
        return reply.status(404 as any).send({ error: 'Project not found' })
      }

      // Get published articles
      const articles = await prisma.article.findMany({
        where: {
          projectId: project.id,
          published: true,
          status: 'published'
        },
        orderBy: {
          publishedAt: 'desc'
        },
        take: limit
      })

      const rss = generateRSSFeed(articles, project, baseUrl)
      
      reply.type('application/rss+xml')
      return reply.send(rss)
    } catch (error) {
      fastify.log.error(error, 'Failed to generate RSS feed')
      return reply.status(500 as any).send({ error: 'Internal server error' })
    }
  })

  // Get structured data for all articles in a project
  fastify.get('/seo/structured-data', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          baseUrl: { type: 'string', format: 'uri' }
        }
      }
    }
  }, async (request, reply) => {
    const { baseUrl } = request.query as { baseUrl?: string }

    if (!request.apiKey) {
      return reply.status(401 as any).send({ error: 'API key required' })
    }

    try {
      // Get project from API key
      const project = await prisma.project.findUnique({
        where: { id: request.apiKey.projectId }
      })

      if (!project) {
        return reply.status(404 as any).send({ error: 'Project not found' })
      }

      // Get published articles
      const articles = await prisma.article.findMany({
        where: {
          projectId: project.id,
          published: true,
          status: 'published'
        },
        orderBy: {
          publishedAt: 'desc'
        }
      })

      const structuredData = articles.map(article => {
        const seoMetadata = generateSeoMetadata(article, project, baseUrl)
        return {
          slug: article.slug,
          structuredData: seoMetadata.structuredData
        }
      })

      return reply.send({
        project: {
          name: project.name,
          slug: project.slug,
          description: project.description
        },
        articles: structuredData,
        generatedAt: new Date().toISOString()
      })
    } catch (error) {
      fastify.log.error(error, 'Failed to get structured data')
      return reply.status(500 as any).send({ error: 'Internal server error' })
    }
  })

  // Get robots.txt content for a project
  fastify.get('/seo/robots', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          baseUrl: { type: 'string', format: 'uri' }
        }
      }
    }
  }, async (request, reply) => {
    const { baseUrl } = request.query as { baseUrl?: string }

    if (!request.apiKey) {
      return reply.status(401 as any).send({ error: 'API key required' })
    }

    try {
      // Get project from API key
      const project = await prisma.project.findUnique({
        where: { id: request.apiKey.projectId }
      })

      if (!project) {
        return reply.status(404 as any).send({ error: 'Project not found' })
      }

      const sitemapUrl = baseUrl ? `${baseUrl}/v1/seo/sitemap?baseUrl=${encodeURIComponent(baseUrl)}` : undefined

      const robotsContent = `User-agent: *
Allow: /

${sitemapUrl ? `Sitemap: ${sitemapUrl}` : ''}

# Generated by Simplist API
# Project: ${project.name}
# Generated at: ${new Date().toISOString()}`

      reply.type('text/plain')
      return reply.send(robotsContent)
    } catch (error) {
      fastify.log.error(error, 'Failed to generate robots.txt')
      return reply.status(500 as any).send({ error: 'Internal server error' })
    }
  })
}

export default seoRoutes
import fp from 'fastify-plugin'
import fastifyEnv from '@fastify/env'

const schema = {
  type: 'object',
  required: ['DATABASE_URL'],
  properties: {
    PORT: {
      type: 'string',
      default: '3001'
    },
    HOST: {
      type: 'string', 
      default: 'localhost'
    },
    NODE_ENV: {
      type: 'string',
      default: 'development'
    },
    DATABASE_URL: {
      type: 'string'
    },
    ALLOWED_ORIGINS: {
      type: 'string',
      default: 'http://localhost:3000'
    }
  }
}

export default fp(async function (fastify) {
  await fastify.register(fastifyEnv, {
    schema,
    dotenv: true
  })
})
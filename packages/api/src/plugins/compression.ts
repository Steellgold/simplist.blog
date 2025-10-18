import compress from '@fastify/compress'
import fp from 'fastify-plugin'

export default fp(async function (fastify) {
  await fastify.register(compress, {
    global: true,
    encodings: ['gzip', 'deflate', 'br'],
    threshold: 1024 // Only compress responses > 1KB
  })
})
import fp from 'fastify-plugin'
import compress from '@fastify/compress'

export default fp(async function (fastify) {
  await fastify.register(compress, {
    global: true,
    encodings: ['gzip', 'deflate', 'br'],
    threshold: 1024 // Only compress responses > 1KB
  })
})
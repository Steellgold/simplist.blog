import "fastify";
import type { FastifyRequest } from "fastify";

declare module "fastify" {
  interface FastifyInstance {
    config: {
      ALLOW_ALL_ORIGINS?: string;
      ALLOWED_ORIGINS: string;
      ALLOWED_ORIGIN_SUFFIXES?: string;
      [key: string]: unknown;
    };
  }
}

export function parseBody<T = Record<string, unknown>>(
  request: FastifyRequest,
): T {
  return request.body as T;
}

export function parseQuery<T = Record<string, unknown>>(
  request: FastifyRequest,
): T {
  return request.query as T;
}

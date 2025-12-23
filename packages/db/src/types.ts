export { SubscriptionTier } from "../generated/client";
export type { ApiKey, Article, Project, User } from "../generated/client";

import type { Prisma } from "../generated/client";

/**
 * ApiKey with project relation included
 */
export type ApiKeyWithProject = Prisma.ApiKeyGetPayload<{
  include: {
    project: {
      select: {
        id: true;
        name: true;
        slug: true;
        userId: true;
      };
    };
  };
}>;

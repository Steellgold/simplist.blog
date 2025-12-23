import type { Prisma } from "@simplist/db";

/**
 * Member with user info and role - used in members list
 */
export type MemberWithDetails = Prisma.ProjectMemberGetPayload<{
  include: {
    user: {
      select: {
        id: true;
        name: true;
        email: true;
        image: true;
      };
    };
    role: true;
  };
}>;

/**
 * Flattened member type for client components
 */
export type MemberListItem = {
  id: string;
  userId: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: {
    id: string;
    name: string;
    slug: string;
    isOwner: boolean;
    isDefault: boolean;
  };
  joinedAt: Date | null;
};

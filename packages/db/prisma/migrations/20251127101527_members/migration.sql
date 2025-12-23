/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `project` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `createdBy` to the `article` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED');

-- DropIndex
DROP INDEX "project_slug_userId_key";

-- AlterTable
ALTER TABLE "article" ADD COLUMN     "createdBy" TEXT NOT NULL,
ADD COLUMN     "updatedBy" TEXT;

-- CreateTable
CREATE TABLE "project_role" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "canManageProject" BOOLEAN NOT NULL DEFAULT false,
    "canManageMembers" BOOLEAN NOT NULL DEFAULT false,
    "canManageRoles" BOOLEAN NOT NULL DEFAULT false,
    "canManageArticles" BOOLEAN NOT NULL DEFAULT false,
    "canManageApiKeys" BOOLEAN NOT NULL DEFAULT false,
    "canViewAnalytics" BOOLEAN NOT NULL DEFAULT true,
    "canManageBilling" BOOLEAN NOT NULL DEFAULT false,
    "canDeleteProject" BOOLEAN NOT NULL DEFAULT false,
    "isOwner" BOOLEAN NOT NULL DEFAULT false,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_member" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "invitedBy" TEXT,
    "invitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "joinedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_invitation" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "status" "InvitationStatus" NOT NULL DEFAULT 'PENDING',
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "invitedBy" TEXT NOT NULL,
    "invitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acceptedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_invitation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "project_role_projectId_isDefault_idx" ON "project_role"("projectId", "isDefault");

-- CreateIndex
CREATE UNIQUE INDEX "project_role_projectId_slug_key" ON "project_role"("projectId", "slug");

-- CreateIndex
CREATE INDEX "project_member_projectId_roleId_idx" ON "project_member"("projectId", "roleId");

-- CreateIndex
CREATE INDEX "project_member_userId_idx" ON "project_member"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "project_member_userId_projectId_key" ON "project_member"("userId", "projectId");

-- CreateIndex
CREATE UNIQUE INDEX "project_invitation_token_key" ON "project_invitation"("token");

-- CreateIndex
CREATE INDEX "project_invitation_token_idx" ON "project_invitation"("token");

-- CreateIndex
CREATE INDEX "project_invitation_projectId_status_idx" ON "project_invitation"("projectId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "project_invitation_email_projectId_status_key" ON "project_invitation"("email", "projectId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "project_slug_key" ON "project"("slug");

-- AddForeignKey
ALTER TABLE "project_role" ADD CONSTRAINT "project_role_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_member" ADD CONSTRAINT "project_member_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_member" ADD CONSTRAINT "project_member_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_member" ADD CONSTRAINT "project_member_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "project_role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_invitation" ADD CONSTRAINT "project_invitation_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

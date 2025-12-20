"use server";

import { auth } from "@/lib/auth";
import { getCurrentUser } from "@/lib/auth-helper";
import { prisma } from "@simplist/db";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const changePassword = async (
  currentPassword: string,
  newPassword: string,
) => {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Check if user has a credential account
  const account = await prisma.account.findFirst({
    where: {
      userId: user.id,
      providerId: "credential",
    },
    select: {
      id: true,
    },
  });

  // If no credential account (OAuth user setting first password)
  if (!account) {
    await auth.api.setPassword({
      body: {
        newPassword,
      },
      headers: await headers(),
    });

    revalidatePath("/account/settings/security", "page");
    return { success: true };
  }

  // User already has password, change it
  await auth.api.changePassword({
    body: {
      currentPassword,
      newPassword,
      revokeOtherSessions: false,
    },
    headers: await headers(),
  });

  revalidatePath("/account/settings/security", "page");
  return { success: true };
};

export const deletePasskey = async (passkeyId: string) => {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Verify passkey belongs to user
  const passkey = await prisma.passkey.findFirst({
    where: {
      id: passkeyId,
      userId: user.id,
    },
    select: {
      id: true,
    },
  });

  if (!passkey) {
    throw new Error("Passkey not found");
  }

  // Delete passkey
  await auth.api.deletePasskey({
    body: {
      id: passkeyId,
    },
    headers: await headers(),
  });

  revalidatePath("/account/settings/security", "page");

  return { success: true };
};

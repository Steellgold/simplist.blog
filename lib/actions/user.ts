"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getCurrentUser } from "../auth-helper"
import { prisma } from "@simplist/db"
import { UpdateUserInformationInput, updateUserInformationSchema } from "../validations/user"

export const updateUserInformation = async (input: UpdateUserInformationInput) => {
  const user = await getCurrentUser()

  if (!user) redirect("/auth/login")

  // Validate input
  const validatedInput = updateUserInformationSchema.parse(input)

  // Update user information
  const updatedUser = await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      firstName: validatedInput.firstName,
      lastName: validatedInput.lastName,
      name: `${validatedInput.firstName} ${validatedInput.lastName}`
    }
  });

  // Revalidate the account settings page and layout
  revalidatePath("/account/settings", "page")
  revalidatePath("/account", "layout")

  return updatedUser
}

export const updateUserNameFields = async (firstName: string, lastName: string) => {
  const user = await getCurrentUser()

  if (!user) {
    throw new Error("Not authenticated")
  }

  // Update user with firstName and lastName (used after registration)
  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      firstName,
      lastName,
    },
  })
}

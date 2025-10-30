import { z } from "zod";

export const updateUserInformationSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name must be less than 50 characters"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name must be less than 50 characters"),
})

export type UpdateUserInformationInput = z.infer<typeof updateUserInformationSchema>

export const deleteAccountSchema = z.object({
  password: z.string().min(1, "Password is required to delete your account"),
  confirmation: z.string().min(1, "Please type 'DELETE' to confirm").refine((val) => val.toLowerCase() === "delete", {
    message: "Please type 'DELETE' to confirm",
  }),
})

export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>

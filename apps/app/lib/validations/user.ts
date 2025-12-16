import { z } from "zod";

export const updateUserInformationSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name must be less than 50 characters"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name must be less than 50 characters")
})

export const updateUserEmailSchema = z.object({
  email: z.email("Invalid email address")
    .min(1, "Email is required")
})

export type UpdateUserInformationInput = z.infer<typeof updateUserInformationSchema>
export type UpdateUserEmailInput = z.infer<typeof updateUserEmailSchema>

export const requestAccountDeletionSchema = z.object({
  confirmation: z.string().min(1, "Please type 'DELETE' to confirm").refine((val) => val.trim().toLowerCase() === "delete", {
    message: "Please type 'DELETE' to confirm",
  }),
  reason: z
    .string()
    .max(500, "Reason must be 500 characters or less")
    .optional()
})

export type RequestAccountDeletionInput = z.infer<typeof requestAccountDeletionSchema>
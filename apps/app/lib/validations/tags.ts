import { ColorsEnum } from "@simplist/ui/lib/color";
import { IconsEnum } from "@simplist/ui/lib/icons.enum";
import { z } from "zod";

export const createTagSchema = z.object({
  name: z
    .string()
    .min(1, "Tag name is required")
    .max(50, "Tag name must be less than 50 characters")
    .trim(),
  icon: IconsEnum.default("tag"),
  color: ColorsEnum.nullable().default(null),
});

export type CreateTagInput = z.infer<typeof createTagSchema>;

export const updateTagSchema = z.object({
  name: z
    .string()
    .min(1, "Tag name is required")
    .max(50, "Tag name must be less than 50 characters")
    .trim()
    .optional(),
  icon: IconsEnum.optional(),
  color: ColorsEnum.nullable().optional(),
});

export type UpdateTagInput = z.infer<typeof updateTagSchema>;

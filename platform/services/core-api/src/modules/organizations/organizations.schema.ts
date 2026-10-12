import { z } from "zod";

export const organizationSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  slug: z.string(),
  createdAt: z.iso.datetime(),
});
export type Organization = z.infer<typeof organizationSchema>;

export const createOrganizationBody = z.object({
  name: z.string().trim().min(2).max(80),
  slug: z
    .string()
    .trim()
    .min(3)
    .max(40)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "lowercase letters, numbers and dashes"),
});
export type CreateOrganizationInput = z.infer<typeof createOrganizationBody>;

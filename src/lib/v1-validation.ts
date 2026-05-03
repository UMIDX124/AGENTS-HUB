import { z } from "zod";

export const auditBodySchema = z.object({
  url: z.string().url(),
  depth: z.enum(["teaser", "full"]),
  email: z.string().email().optional(),
  idempotencyKey: z.string().min(1).max(200).optional(),
});

export type AuditBody = z.infer<typeof auditBodySchema>;

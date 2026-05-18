import { z } from "zod";

export const documentStatusValues = ["DRAFT", "VERIFIED", "REVOKED", "EXPIRED"] as const;

export const documentStatusSchema = z.enum(documentStatusValues);

export const documentRecordInputSchema = z.object({
  title: z.string().trim().min(1, "Sarlavha kiritish majburiy").max(200),
  fullName: z.string().trim().min(1, "F.I.O kiritish majburiy").max(200),
  passport: z.string().trim().min(1, "Passport kiritish majburiy").max(100),
  issuedDate: z.coerce.date(),
  status: documentStatusSchema
});

export type DocumentRecordInput = z.infer<typeof documentRecordInputSchema>;

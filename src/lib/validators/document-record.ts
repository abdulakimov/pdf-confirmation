import { z } from "zod";

export const documentStatusValues = ["DRAFT", "VERIFIED", "REVOKED", "EXPIRED"] as const;

export const documentStatusSchema = z.enum(documentStatusValues);

const optionalTrimmedString = z.preprocess((value) => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}, z.string().max(255).optional());

export const documentRecordInputSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  fullName: z.string().trim().min(1, "Full name is required").max(200),
  passport: z.string().trim().min(1, "Passport is required").max(100),
  issuedDate: z.coerce.date(),
  status: documentStatusSchema,
  stampImageKey: optionalTrimmedString
});

export type DocumentRecordInput = z.infer<typeof documentRecordInputSchema>;
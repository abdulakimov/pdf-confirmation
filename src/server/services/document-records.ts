import type { DocumentRecord } from "@prisma/client";

import { prisma } from "@/lib/db";
import type { DocumentRecordInput } from "@/lib/validators";

import { generatePublicVerificationToken } from "./public-token";

const PUBLIC_TOKEN_ATTEMPTS = 8;

export type DocumentRecordSnapshot = {
  id: string;
  publicToken: string;
  title: string;
  fullName: string;
  passport: string;
  issuedDate: Date;
  status: DocumentRecord["status"];
  stampImageKey: string | null;
  publishedAt: Date | null;
  revokedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export function snapshotDocumentRecord(
  documentRecord: DocumentRecord
): DocumentRecordSnapshot {
  return {
    id: documentRecord.id,
    publicToken: documentRecord.publicToken,
    title: documentRecord.title,
    fullName: documentRecord.fullName,
    passport: documentRecord.passport,
    issuedDate: documentRecord.issuedDate,
    status: documentRecord.status,
    stampImageKey: documentRecord.stampImageKey,
    publishedAt: documentRecord.publishedAt,
    revokedAt: documentRecord.revokedAt,
    createdAt: documentRecord.createdAt,
    updatedAt: documentRecord.updatedAt
  };
}

export async function listDocumentRecords() {
  return prisma.documentRecord.findMany({
    orderBy: [{ createdAt: "desc" }]
  });
}

export async function getDocumentRecordById(id: string) {
  return prisma.documentRecord.findUnique({
    where: { id },
    include: {
      files: {
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }]
      }
    }
  });
}

function getLifecycleDates(status: DocumentRecordInput["status"], existing?: DocumentRecord) {
  const now = new Date();
  const publishedAt = existing?.publishedAt ?? (status === "DRAFT" ? null : now);
  const revokedAt =
    status === "REVOKED"
      ? existing?.revokedAt ?? now
      : existing?.revokedAt ?? null;

  return {
    publishedAt,
    revokedAt: status === "REVOKED" ? revokedAt : null
  };
}

function buildAuditSnapshot(documentRecord: {
  id: string;
  publicToken: string;
  title: string;
  fullName: string;
  passport: string;
  issuedDate: Date;
  status: DocumentRecord["status"];
  stampImageKey: string | null;
  publishedAt: Date | null;
  revokedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: documentRecord.id,
    publicToken: documentRecord.publicToken,
    title: documentRecord.title,
    fullName: documentRecord.fullName,
    passport: documentRecord.passport,
    issuedDate: documentRecord.issuedDate.toISOString(),
    status: documentRecord.status,
    stampImageKey: documentRecord.stampImageKey,
    publishedAt: documentRecord.publishedAt?.toISOString() ?? null,
    revokedAt: documentRecord.revokedAt?.toISOString() ?? null,
    createdAt: documentRecord.createdAt.toISOString(),
    updatedAt: documentRecord.updatedAt.toISOString()
  };
}

export async function createDocumentRecord(input: DocumentRecordInput) {
  for (let attempt = 0; attempt < PUBLIC_TOKEN_ATTEMPTS; attempt += 1) {
    const publicToken = generatePublicVerificationToken();
    const existing = await prisma.documentRecord.findUnique({
      where: { publicToken },
      select: { id: true }
    });

    if (existing) {
      continue;
    }

    const { publishedAt, revokedAt } = getLifecycleDates(input.status);

    try {
      return await prisma.$transaction(async (tx) => {
        const created = await tx.documentRecord.create({
          data: {
            publicToken,
            title: input.title,
            fullName: input.fullName,
            passport: input.passport,
            issuedDate: input.issuedDate,
            status: input.status,
            stampImageKey: input.stampImageKey ?? null,
            publishedAt,
            revokedAt
          }
        });

        await tx.auditLog.create({
          data: {
            action: "document_record_created",
            documentRecordId: created.id,
            metadata: {
              after: buildAuditSnapshot(created)
            }
          }
        });

        return created;
      });
    } catch (error) {
      if ((error as { code?: string }).code === "P2002") {
        continue;
      }

      throw error;
    }
  }

  throw new Error("Unable to create a unique document record.");
}

export async function updateDocumentRecord(
  documentRecordId: string,
  input: DocumentRecordInput
) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.documentRecord.findUnique({
      where: { id: documentRecordId }
    });

    if (!existing) {
      throw new Error("Document record not found.");
    }

    const { publishedAt, revokedAt } = getLifecycleDates(input.status, existing);

    const updated = await tx.documentRecord.update({
      where: { id: documentRecordId },
      data: {
        title: input.title,
        fullName: input.fullName,
        passport: input.passport,
        issuedDate: input.issuedDate,
        status: input.status,
        stampImageKey: input.stampImageKey ?? null,
        publishedAt,
        revokedAt
      }
    });

    await tx.auditLog.create({
      data: {
        action: "document_record_updated",
        documentRecordId: updated.id,
        metadata: {
          before: buildAuditSnapshot(existing),
          after: buildAuditSnapshot(updated)
        }
      }
    });

    return updated;
  });
}

export async function revokeDocumentRecord(documentRecordId: string) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.documentRecord.findUnique({
      where: { id: documentRecordId }
    });

    if (!existing) {
      throw new Error("Document record not found.");
    }

    const now = new Date();
    const revokedAt = existing.revokedAt ?? now;
    const publishedAt = existing.publishedAt ?? now;

    const updated = await tx.documentRecord.update({
      where: { id: documentRecordId },
      data: {
        status: "REVOKED",
        publishedAt,
        revokedAt
      }
    });

    await tx.auditLog.create({
      data: {
        action: "document_record_revoked",
        documentRecordId: updated.id,
        metadata: {
          before: buildAuditSnapshot(existing),
          after: buildAuditSnapshot(updated),
          revokedAt: updated.revokedAt?.toISOString() ?? null
        }
      }
    });

    return updated;
  });
}
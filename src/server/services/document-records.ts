import type { DocumentRecord } from "@prisma/client";

import { prisma } from "@/lib/db";
import type { DocumentRecordInput } from "@/lib/validators";

import { generatePublicVerificationToken } from "./public-token";

const PUBLIC_TOKEN_ATTEMPTS = 8;

type LifecycleFields = {
  publishedAt: Date | null;
  revokedAt: Date | null;
  revokedReason: string | null;
};

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
  revokedReason: string | null;
  createdAt: Date;
  updatedAt: Date;
};

function normalizeRevokedReason(revokedReason?: string | null) {
  const trimmed = revokedReason?.trim() ?? "";
  return trimmed.length > 0 ? trimmed : null;
}

function sameDate(left: Date | null, right: Date | null) {
  if (!left && !right) {
    return true;
  }

  if (!left || !right) {
    return false;
  }

  return left.getTime() === right.getTime();
}

function getLifecycleFields(
  status: DocumentRecordInput["status"],
  existing?: DocumentRecord,
  revokedReason?: string | null
): LifecycleFields {
  const now = new Date();
  const publishedAt = existing?.publishedAt ?? (status === "DRAFT" ? null : now);

  if (status === "REVOKED") {
    return {
      publishedAt,
      revokedAt: existing?.revokedAt ?? now,
      revokedReason: normalizeRevokedReason(revokedReason) ?? existing?.revokedReason ?? null
    };
  }

  return {
    publishedAt,
    revokedAt: null,
    revokedReason: null
  };
}

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
    revokedReason: documentRecord.revokedReason,
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
  revokedReason: string | null;
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
    revokedReason: documentRecord.revokedReason,
    createdAt: documentRecord.createdAt.toISOString(),
    updatedAt: documentRecord.updatedAt.toISOString()
  };
}

async function setDocumentRecordStatus(
  documentRecordId: string,
  status: DocumentRecord["status"],
  action: string,
  revokedReason?: string | null
) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.documentRecord.findUnique({
      where: { id: documentRecordId }
    });

    if (!existing) {
      throw new Error("Hujjat yozuvi topilmadi.");
    }

    const { publishedAt, revokedAt, revokedReason: nextRevokedReason } =
      getLifecycleFields(status, existing, revokedReason);

    const unchanged =
      existing.status === status &&
      sameDate(existing.publishedAt, publishedAt) &&
      sameDate(existing.revokedAt, revokedAt) &&
      existing.revokedReason === nextRevokedReason;

    if (unchanged) {
      return existing;
    }

    const updated = await tx.documentRecord.update({
      where: { id: documentRecordId },
      data: {
        status,
        publishedAt,
        revokedAt,
        revokedReason: nextRevokedReason
      }
    });

    await tx.auditLog.create({
      data: {
        action,
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

    const { publishedAt, revokedAt, revokedReason } = getLifecycleFields(input.status);

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
            publishedAt,
            revokedAt,
            revokedReason
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

  throw new Error("Yagona hujjat yozuvini yaratib bo'lmadi.");
}

export async function deleteDocumentRecordForCleanup(documentRecordId: string) {
  const trimmedDocumentRecordId = documentRecordId.trim();
  if (!trimmedDocumentRecordId) {
    return;
  }

  await prisma.$transaction(async (tx) => {
    await tx.auditLog.deleteMany({
      where: { documentRecordId: trimmedDocumentRecordId }
    });

    await tx.documentFile.deleteMany({
      where: { documentRecordId: trimmedDocumentRecordId }
    });

    await tx.documentRecord.deleteMany({
      where: { id: trimmedDocumentRecordId }
    });
  });
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
      throw new Error("Hujjat yozuvi topilmadi.");
    }

    const { publishedAt, revokedAt, revokedReason } = getLifecycleFields(
      input.status,
      existing
    );

    const updated = await tx.documentRecord.update({
      where: { id: documentRecordId },
      data: {
        title: input.title,
        fullName: input.fullName,
        passport: input.passport,
        issuedDate: input.issuedDate,
        status: input.status,
        publishedAt,
        revokedAt,
        revokedReason
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

export async function publishDocumentRecord(documentRecordId: string) {
  return setDocumentRecordStatus(
    documentRecordId,
    "VERIFIED",
    "document_record_published"
  );
}

export async function revokeDocumentRecord(
  documentRecordId: string,
  revokedReason?: string | null
) {
  return setDocumentRecordStatus(
    documentRecordId,
    "REVOKED",
    "document_record_revoked",
    revokedReason
  );
}

export async function expireDocumentRecord(documentRecordId: string) {
  return setDocumentRecordStatus(
    documentRecordId,
    "EXPIRED",
    "document_record_expired"
  );
}

export async function returnDocumentRecordToDraft(documentRecordId: string) {
  return setDocumentRecordStatus(
    documentRecordId,
    "DRAFT",
    "document_record_returned_to_draft"
  );
}

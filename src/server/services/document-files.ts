import { createHash } from "node:crypto";

import type { DocumentFile } from "@prisma/client";

import { prisma } from "@/lib/db";
import {
  createDocumentFileStorageKey,
  deleteLocalPdf,
  readLocalPdf,
  writeLocalPdf
} from "@/lib/storage";

const DEFAULT_MAX_PDF_MB = 20;
function getMaxPdfBytes() {
  const parsed = Number(process.env.MAX_PDF_MB ?? `${DEFAULT_MAX_PDF_MB}`);
  const maxPdfMb = Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_MAX_PDF_MB;
  return Math.floor(maxPdfMb * 1024 * 1024);
}

function getUploadedPdfError(file: File, maxPdfBytes: number) {
  if (file.size === 0) {
    return `File \"${file.name}\" is empty.`;
  }

  if (file.size > maxPdfBytes) {
    const maxPdfMb = Math.floor(maxPdfBytes / (1024 * 1024));
    return `File \"${file.name}\" exceeds the ${maxPdfMb} MB limit.`;
  }

  if (file.type !== "application/pdf") {
    return `File \"${file.name}\" must be a PDF.`;
  }

  return null;
}

function checksumOf(buffer: Buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

function buildDocumentFileAuditSnapshot(documentFile: DocumentFile) {
  return {
    id: documentFile.id,
    documentRecordId: documentFile.documentRecordId,
    originalName: documentFile.originalName,
    storageKey: documentFile.storageKey,
    mimeType: documentFile.mimeType,
    sizeBytes: documentFile.sizeBytes,
    checksum: documentFile.checksum,
    sortOrder: documentFile.sortOrder,
    createdAt: documentFile.createdAt.toISOString(),
    updatedAt: documentFile.updatedAt.toISOString()
  };
}

export async function listDocumentFiles(documentRecordId: string) {
  return prisma.documentFile.findMany({
    where: { documentRecordId },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }]
  });
}

export async function getDocumentRecordWithFilesById(id: string) {
  return prisma.documentRecord.findUnique({
    where: { id },
    include: {
      files: {
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }]
      }
    }
  });
}

export async function getVerifiedDocumentFileByTokenAndFileId(
  publicToken: string,
  fileId: string
) {
  const record = await prisma.documentRecord.findFirst({
    where: {
      publicToken,
      status: "VERIFIED",
      files: {
        some: { id: fileId }
      }
    },
    include: {
      files: {
        where: { id: fileId },
        take: 1
      }
    }
  });

  if (!record || record.files.length === 0) {
    return null;
  }

  return {
    documentRecord: record,
    documentFile: record.files[0]
  };
}

export async function readDocumentFileContent(storageKey: string) {
  return readLocalPdf(storageKey);
}

export async function uploadDocumentFiles(documentRecordId: string, files: File[]) {
  if (files.length === 0) {
    throw new Error("Select at least one PDF file.");
  }

  const documentRecord = await prisma.documentRecord.findUnique({
    where: { id: documentRecordId },
    select: { id: true }
  });

  if (!documentRecord) {
    throw new Error("Document record not found.");
  }

  const maxPdfBytes = getMaxPdfBytes();
  const preparedFiles: Array<{
    checksum: string;
    mimeType: string;
    originalName: string;
    sizeBytes: number;
    storageKey: string;
    buffer: Buffer;
  }> = [];

  for (const file of files) {
    const validationError = getUploadedPdfError(file, maxPdfBytes);
    if (validationError) {
      throw new Error(validationError);
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    if (buffer.subarray(0, 5).toString("utf8") !== "%PDF-") {
      throw new Error(`File \"${file.name}\" is not a valid PDF.`);
    }

    const storageKey = createDocumentFileStorageKey(documentRecordId);
    preparedFiles.push({
      checksum: checksumOf(buffer),
      mimeType: "application/pdf",
      originalName: file.name,
      sizeBytes: buffer.byteLength,
      storageKey,
      buffer
    });
  }

  const writtenStorageKeys: string[] = [];

  try {
    for (const file of preparedFiles) {
      await writeLocalPdf(file.storageKey, file.buffer);
      writtenStorageKeys.push(file.storageKey);
    }

    return await prisma.$transaction(async (tx) => {
      const sortOrderSeed = await tx.documentFile.aggregate({
        where: { documentRecordId },
        _max: { sortOrder: true }
      });
      let nextSortOrder = (sortOrderSeed._max.sortOrder ?? -1) + 1;

      const createdFiles: DocumentFile[] = [];
      for (const file of preparedFiles) {
        const created = await tx.documentFile.create({
          data: {
            documentRecordId,
            originalName: file.originalName,
            storageKey: file.storageKey,
            mimeType: file.mimeType,
            sizeBytes: file.sizeBytes,
            checksum: file.checksum,
            sortOrder: nextSortOrder
          }
        });
        createdFiles.push(created);
        nextSortOrder += 1;
      }

      if (createdFiles.length > 0) {
        await tx.auditLog.create({
          data: {
            action: "document_files_uploaded",
            documentRecordId,
            metadata: {
              uploadedFiles: createdFiles.map(buildDocumentFileAuditSnapshot)
            }
          }
        });
      }

      return createdFiles;
    });
  } catch (error) {
    await Promise.allSettled(writtenStorageKeys.map((storageKey) => deleteLocalPdf(storageKey)));
    throw error;
  }
}

export async function deleteDocumentFile(
  documentRecordId: string,
  documentFileId: string
) {
  const deletedDocumentFile = await prisma.$transaction(async (tx) => {
    const documentFile = await tx.documentFile.findFirst({
      where: {
        id: documentFileId,
        documentRecordId
      }
    });

    if (!documentFile) {
      throw new Error("Document file not found.");
    }

    await tx.documentFile.delete({
      where: { id: documentFile.id }
    });

    const filesToReorder = await tx.documentFile.findMany({
      where: {
        documentRecordId,
        sortOrder: {
          gt: documentFile.sortOrder
        }
      },
      orderBy: [{ sortOrder: "asc" }]
    });

    for (const file of filesToReorder) {
      await tx.documentFile.update({
        where: { id: file.id },
        data: {
          sortOrder: file.sortOrder - 1
        }
      });
    }

    await tx.auditLog.create({
      data: {
        action: "document_file_deleted",
        documentRecordId,
        metadata: {
          deletedFile: buildDocumentFileAuditSnapshot(documentFile)
        }
      }
    });

    return documentFile;
  });

  await deleteLocalPdf(deletedDocumentFile.storageKey);
  return deletedDocumentFile;
}
import path from "node:path";

import { prisma } from "@/lib/db";
import {
  createDocumentStampImageStorageKey,
  deleteLocalImage,
  readLocalImage,
  writeLocalImage
} from "@/lib/storage";

const DEFAULT_MAX_STAMP_IMAGE_MB = 5;

const STAMP_IMAGE_MIME_TYPES = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp"
} as const;

type StampImageMimeType = keyof typeof STAMP_IMAGE_MIME_TYPES;

function getMaxStampImageMb() {
  const parsed = Number(process.env.MAX_STAMP_IMAGE_MB ?? `${DEFAULT_MAX_STAMP_IMAGE_MB}`);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_MAX_STAMP_IMAGE_MB;
}

function getMaxStampImageBytes() {
  return Math.floor(getMaxStampImageMb() * 1024 * 1024);
}

function isPng(buffer: Buffer) {
  return buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([
    0x89,
    0x50,
    0x4e,
    0x47,
    0x0d,
    0x0a,
    0x1a,
    0x0a
  ]));
}

function isJpeg(buffer: Buffer) {
  return buffer.length >= 3 && buffer.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]));
}

function isWebp(buffer: Buffer) {
  return (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP"
  );
}

function getStampImageExtension(mimeType: StampImageMimeType) {
  return STAMP_IMAGE_MIME_TYPES[mimeType];
}

function getStampImageMimeTypeFromStorageKey(storageKey: string) {
  const extension = path.extname(storageKey).toLowerCase();

  switch (extension) {
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".webp":
      return "image/webp";
    default:
      return null;
  }
}

function getUploadedStampImageError(file: File, maxStampImageBytes: number) {
  if (file.size === 0) {
    return `Muhr tasviri "${file.name}" bo'sh.`;
  }

  if (file.size > maxStampImageBytes) {
    const maxStampImageMb = Math.floor(maxStampImageBytes / (1024 * 1024));
    return `Muhr tasviri "${file.name}" ${maxStampImageMb} MB limitidan oshib ketdi.`;
  }

  if (!(file.type in STAMP_IMAGE_MIME_TYPES)) {
    return `Muhr tasviri "${file.name}" PNG, JPG, JPEG yoki WEBP bo'lishi kerak.`;
  }

  return null;
}

function validateStampImageContent(file: File, buffer: Buffer) {
  const mimeType = file.type as StampImageMimeType;

  switch (mimeType) {
    case "image/png":
      if (!isPng(buffer)) {
        throw new Error(`Muhr tasviri "${file.name}" yaroqli PNG emas.`);
      }
      break;
    case "image/jpeg":
      if (!isJpeg(buffer)) {
        throw new Error(`Muhr tasviri "${file.name}" yaroqli JPG yoki JPEG emas.`);
      }
      break;
    case "image/webp":
      if (!isWebp(buffer)) {
        throw new Error(`Muhr tasviri "${file.name}" yaroqli WEBP emas.`);
      }
      break;
    default:
      throw new Error(`Muhr tasviri "${file.name}" PNG, JPG, JPEG yoki WEBP bo'lishi kerak.`);
  }

  return mimeType;
}

export function getDocumentStampMaxImageMb() {
  return getMaxStampImageMb();
}

export async function readDocumentStampImageDataUrl(stampImageKey: string | null) {
  if (!stampImageKey) {
    return null;
  }

  const mimeType = getStampImageMimeTypeFromStorageKey(stampImageKey);
  if (!mimeType) {
    return null;
  }

  try {
    const image = await readLocalImage(stampImageKey);
    return `data:${mimeType};base64,${image.toString("base64")}`;
  } catch {
    return null;
  }
}

export async function uploadDocumentStampImage(
  documentRecordId: string,
  file: File
) {
  const documentRecord = await prisma.documentRecord.findUnique({
    where: { id: documentRecordId },
    select: { id: true, stampImageKey: true }
  });

  if (!documentRecord) {
    throw new Error("Hujjat yozuvi topilmadi.");
  }

  const maxStampImageBytes = getMaxStampImageBytes();
  const uploadError = getUploadedStampImageError(file, maxStampImageBytes);
  if (uploadError) {
    throw new Error(uploadError);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (buffer.length === 0) {
    throw new Error(`Muhr tasviri "${file.name}" bo'sh.`);
  }

  const mimeType = validateStampImageContent(file, buffer);
  const storageKey = createDocumentStampImageStorageKey(
    documentRecordId,
    getStampImageExtension(mimeType)
  );

  await writeLocalImage(storageKey, buffer);

  try {
    await prisma.documentRecord.update({
      where: { id: documentRecordId },
      data: {
        stampImageKey: storageKey
      }
    });
  } catch (error) {
    await deleteLocalImage(storageKey).catch(() => undefined);
    throw error;
  }

  if (documentRecord.stampImageKey && documentRecord.stampImageKey !== storageKey) {
    await deleteLocalImage(documentRecord.stampImageKey).catch(() => undefined);
  }

  return storageKey;
}

export async function removeDocumentStampImage(documentRecordId: string) {
  const documentRecord = await prisma.documentRecord.findUnique({
    where: { id: documentRecordId },
    select: { id: true, stampImageKey: true }
  });

  if (!documentRecord) {
    throw new Error("Hujjat yozuvi topilmadi.");
  }

  if (!documentRecord.stampImageKey) {
    return null;
  }

  await prisma.documentRecord.update({
    where: { id: documentRecordId },
    data: {
      stampImageKey: null
    }
  });

  await deleteLocalImage(documentRecord.stampImageKey).catch(() => undefined);
  return documentRecord.stampImageKey;
}

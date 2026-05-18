import path from "node:path";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";

const DEFAULT_LOCAL_UPLOAD_DIR = "./uploads";

function getUploadRootDirectory() {
  return process.env.LOCAL_UPLOAD_DIR?.trim() || DEFAULT_LOCAL_UPLOAD_DIR;
}

export function getLocalUploadRootPath() {
  return path.resolve(process.cwd(), getUploadRootDirectory());
}

export function createDocumentFileStorageKey(documentRecordId: string) {
  return path.posix.join("documents", documentRecordId, `${randomUUID()}.pdf`);
}

function resolveStoragePath(storageKey: string) {
  const uploadRoot = getLocalUploadRootPath();
  const resolvedPath = path.resolve(uploadRoot, storageKey);
  const rootWithSeparator = `${uploadRoot}${path.sep}`;

  if (resolvedPath !== uploadRoot && !resolvedPath.startsWith(rootWithSeparator)) {
    throw new Error("Invalid storage key.");
  }

  return resolvedPath;
}

export async function writeLocalPdf(storageKey: string, data: Buffer) {
  const targetPath = resolveStoragePath(storageKey);
  await mkdir(path.dirname(targetPath), { recursive: true });
  await writeFile(targetPath, data);
}

export async function readLocalPdf(storageKey: string) {
  const targetPath = resolveStoragePath(storageKey);
  return readFile(targetPath);
}

export async function deleteLocalPdf(storageKey: string) {
  const targetPath = resolveStoragePath(storageKey);
  await rm(targetPath, { force: true });
}
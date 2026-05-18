"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  deleteDocumentFile,
  uploadDocumentFiles
} from "@/server/services";

import type { DocumentFileUploadState } from "./document-file-upload-state";

function collectFiles(formData: FormData) {
  const values = formData.getAll("files");
  const files: File[] = [];

  for (const value of values) {
    if (!(value instanceof File)) {
      throw new Error("Iltimos, bir yoki bir nechta PDF faylni tanlang.");
    }

    files.push(value);
  }

  return files;
}

function toActionError(error: unknown): DocumentFileUploadState {
  if (error instanceof Error) {
    return { formError: error.message };
  }

  return { formError: "PDF fayllarni yuklab bo'lmadi." };
}

function redirectToEditWithToast(
  documentRecordId: string,
  message: string,
  kind: "success" | "error" = "success"
): never {
  return redirect(
    `/admin/documents/${documentRecordId}/edit?toast=${encodeURIComponent(message)}&toastKind=${kind}`
  );
}

export async function uploadDocumentFilesAction(
  documentRecordId: string,
  _: DocumentFileUploadState,
  formData: FormData
): Promise<DocumentFileUploadState> {
  const trimmedDocumentRecordId = documentRecordId.trim();
  if (!trimmedDocumentRecordId) {
    return { formError: "Hujjat yozuvi identifikatori yetishmayapti." };
  }

  try {
    const files = collectFiles(formData);
    await uploadDocumentFiles(trimmedDocumentRecordId, files);
    revalidatePath(`/admin/documents/${trimmedDocumentRecordId}/edit`);
  } catch (error) {
    return toActionError(error);
  }

  redirectToEditWithToast(trimmedDocumentRecordId, "PDF fayllar yuklandi.");
}

export async function deleteDocumentFileAction(
  documentRecordId: string,
  documentFileId: string
) {
  const trimmedDocumentRecordId = documentRecordId.trim();
  const trimmedDocumentFileId = documentFileId.trim();

  if (!trimmedDocumentRecordId || !trimmedDocumentFileId) {
    throw new Error("Hujjat fayli identifikatorlari yetishmayapti.");
  }

  await deleteDocumentFile(trimmedDocumentRecordId, trimmedDocumentFileId);
  revalidatePath(`/admin/documents/${trimmedDocumentRecordId}/edit`);
  redirect(`/admin/documents/${trimmedDocumentRecordId}/edit`);
}

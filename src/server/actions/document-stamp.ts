"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  removeDocumentStampImage,
  uploadDocumentStampImage
} from "@/server/services";

import type { DocumentStampUploadState } from "./document-stamp-upload-state";

function toActionError(error: unknown): DocumentStampUploadState {
  if (error instanceof Error) {
    return { formError: error.message };
  }

  return { formError: "Muhr tasvirini saqlab bo'lmadi." };
}

function collectStampImage(formData: FormData) {
  const value = formData.get("stampImage");

  if (!(value instanceof File)) {
    throw new Error("Iltimos, muhr tasvirini tanlang.");
  }

  return value;
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

export async function uploadDocumentStampImageAction(
  documentRecordId: string,
  _: DocumentStampUploadState,
  formData: FormData
): Promise<DocumentStampUploadState> {
  const trimmedDocumentRecordId = documentRecordId.trim();
  if (!trimmedDocumentRecordId) {
    return { formError: "Hujjat yozuvi identifikatori yetishmayapti." };
  }

  try {
    const stampImage = collectStampImage(formData);
    await uploadDocumentStampImage(trimmedDocumentRecordId, stampImage);
    revalidatePath("/admin/documents");
    revalidatePath(`/admin/documents/${trimmedDocumentRecordId}/edit`);
  } catch (error) {
    return toActionError(error);
  }

  redirectToEditWithToast(trimmedDocumentRecordId, "Muhr tasviri yuklandi.");
}

export async function removeDocumentStampImageAction(documentRecordId: string) {
  const trimmedDocumentRecordId = documentRecordId.trim();
  if (!trimmedDocumentRecordId) {
    throw new Error("Hujjat yozuvi identifikatori yetishmayapti.");
  }

  await removeDocumentStampImage(trimmedDocumentRecordId);
  revalidatePath("/admin/documents");
  revalidatePath(`/admin/documents/${trimmedDocumentRecordId}/edit`);
  redirect(`/admin/documents/${trimmedDocumentRecordId}/edit`);
}

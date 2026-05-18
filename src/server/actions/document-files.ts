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
      throw new Error("Please select one or more PDF files.");
    }

    files.push(value);
  }

  return files;
}

function toActionError(error: unknown): DocumentFileUploadState {
  if (error instanceof Error) {
    return { formError: error.message };
  }

  return { formError: "Unable to upload PDF files." };
}

export async function uploadDocumentFilesAction(
  documentRecordId: string,
  _: DocumentFileUploadState,
  formData: FormData
): Promise<DocumentFileUploadState> {
  const trimmedDocumentRecordId = documentRecordId.trim();
  if (!trimmedDocumentRecordId) {
    return { formError: "Missing document record id." };
  }

  try {
    const files = collectFiles(formData);
    await uploadDocumentFiles(trimmedDocumentRecordId, files);
    revalidatePath(`/admin/documents/${trimmedDocumentRecordId}/edit`);
    redirect(`/admin/documents/${trimmedDocumentRecordId}/edit`);
  } catch (error) {
    return toActionError(error);
  }
}

export async function deleteDocumentFileAction(
  documentRecordId: string,
  documentFileId: string
) {
  const trimmedDocumentRecordId = documentRecordId.trim();
  const trimmedDocumentFileId = documentFileId.trim();

  if (!trimmedDocumentRecordId || !trimmedDocumentFileId) {
    throw new Error("Missing document file identifiers.");
  }

  await deleteDocumentFile(trimmedDocumentRecordId, trimmedDocumentFileId);
  revalidatePath(`/admin/documents/${trimmedDocumentRecordId}/edit`);
  redirect(`/admin/documents/${trimmedDocumentRecordId}/edit`);
}
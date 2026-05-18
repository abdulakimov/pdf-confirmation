"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  createDocumentRecord,
  revokeDocumentRecord,
  updateDocumentRecord
} from "@/server/services";
import { documentRecordInputSchema } from "@/lib/validators";

import type { DocumentRecordFormState } from "./document-record-form-state";

function createFieldErrors(error: unknown) {
  if (!(error instanceof Error)) {
    return { formError: "Unable to save document record.", fieldErrors: {} };
  }

  return { formError: error.message, fieldErrors: {} };
}

function parseFieldErrors(formData: FormData) {
  const parsed = documentRecordInputSchema.safeParse({
    title: formData.get("title"),
    fullName: formData.get("fullName"),
    passport: formData.get("passport"),
    issuedDate: formData.get("issuedDate"),
    status: formData.get("status"),
    stampImageKey: formData.get("stampImageKey")
  });

  if (parsed.success) {
    return { data: parsed.data, state: null as DocumentRecordFormState | null };
  }

  const flattened = parsed.error.flatten().fieldErrors;
  const fieldErrors = Object.fromEntries(
    Object.entries(flattened).map(([key, value]) => [key, value?.[0] ?? "Invalid value"])
  ) as DocumentRecordFormState["fieldErrors"];

  return {
    data: null,
    state: {
      formError: "Please fix the highlighted fields.",
      fieldErrors
    }
  };
}

export async function createDocumentRecordAction(
  _: DocumentRecordFormState,
  formData: FormData
): Promise<DocumentRecordFormState> {
  const parsed = parseFieldErrors(formData);
  if (parsed.state) {
    return parsed.state;
  }

  try {
    const data = parsed.data;
    if (!data) {
      return {
        formError: "Unable to save document record.",
        fieldErrors: {}
      };
    }

    const record = await createDocumentRecord(data);
    revalidatePath("/admin/documents");
    redirect(`/admin/documents/${record.id}/edit`);
  } catch (error) {
    return createFieldErrors(error);
  }
}

export async function updateDocumentRecordAction(
  _: DocumentRecordFormState,
  formData: FormData
): Promise<DocumentRecordFormState> {
  const documentRecordId = String(formData.get("documentRecordId") ?? "").trim();
  if (!documentRecordId) {
    return {
      formError: "Missing document record id.",
      fieldErrors: {}
    };
  }

  const parsed = parseFieldErrors(formData);
  if (parsed.state) {
    return parsed.state;
  }

  try {
    const data = parsed.data;
    if (!data) {
      return {
        formError: "Unable to save document record.",
        fieldErrors: {}
      };
    }

    await updateDocumentRecord(documentRecordId, data);
    revalidatePath("/admin/documents");
    revalidatePath(`/admin/documents/${documentRecordId}/edit`);
    redirect(`/admin/documents/${documentRecordId}/edit`);
  } catch (error) {
    return createFieldErrors(error);
  }
}

export async function revokeDocumentRecordAction(documentRecordId: string) {
  const trimmedId = documentRecordId.trim();
  if (!trimmedId) {
    throw new Error("Missing document record id.");
  }

  await revokeDocumentRecord(trimmedId);
  revalidatePath("/admin/documents");
  revalidatePath(`/admin/documents/${trimmedId}/edit`);
  redirect(`/admin/documents/${trimmedId}/edit`);
}
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  createDocumentRecord,
  expireDocumentRecord,
  publishDocumentRecord,
  revokeDocumentRecord,
  returnDocumentRecordToDraft,
  updateDocumentRecord
} from "@/server/services";
import { documentRecordInputSchema } from "@/lib/validators";

import type { DocumentRecordFormState } from "./document-record-form-state";

function createFieldErrors(error: unknown) {
  if (!(error instanceof Error)) {
    return {
      formError: "Hujjat yozuvini saqlab bo'lmadi.",
      fieldErrors: {},
      createdDocumentRecordId: null
    };
  }

  return {
    formError: error.message,
    fieldErrors: {},
    createdDocumentRecordId: null
  };
}

function parseFieldErrors(formData: FormData) {
  const parsed = documentRecordInputSchema.safeParse({
    title: formData.get("title"),
    fullName: formData.get("fullName"),
    passport: formData.get("passport"),
    issuedDate: formData.get("issuedDate"),
    status: formData.get("status")
  });

  if (parsed.success) {
    return { data: parsed.data, state: null as DocumentRecordFormState | null };
  }

  const flattened = parsed.error.flatten().fieldErrors;
  const fieldErrors = Object.fromEntries(
    Object.entries(flattened).map(([key, value]) => [key, value?.[0] ?? "Noto'g'ri qiymat"])
  ) as DocumentRecordFormState["fieldErrors"];

  return {
    data: null,
    state: {
      formError: "Ajratib ko'rsatilgan maydonlarni tuzating.",
      fieldErrors,
      createdDocumentRecordId: null
    }
  };
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

async function revalidateDocumentRecordRoutes(documentRecordId: string) {
  revalidatePath("/");
  revalidatePath(`/admin/documents/${documentRecordId}/edit`);
}

export async function createDocumentRecordAction(
  _: DocumentRecordFormState,
  formData: FormData
): Promise<DocumentRecordFormState> {
  const parsed = parseFieldErrors(formData);
  if (parsed.state) {
    return parsed.state;
  }

  const data = parsed.data;
  if (!data) {
    return {
      formError: "Hujjat yozuvini saqlab bo'lmadi.",
      fieldErrors: {},
      createdDocumentRecordId: null
    };
  }

  try {
    const record = await createDocumentRecord(data);
    revalidatePath("/");

    return {
      formError: null,
      fieldErrors: {},
      createdDocumentRecordId: record.id
    };
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
      formError: "Hujjat yozuvi identifikatori yetishmayapti",
      fieldErrors: {},
      createdDocumentRecordId: null
    };
  }

  const parsed = parseFieldErrors(formData);
  if (parsed.state) {
    return parsed.state;
  }

  const data = parsed.data;
  if (!data) {
    return {
      formError: "Hujjat yozuvini saqlab bo'lmadi.",
      fieldErrors: {},
      createdDocumentRecordId: null
    };
  }

  try {
    await updateDocumentRecord(documentRecordId, data);
    revalidateDocumentRecordRoutes(documentRecordId);
  } catch (error) {
    return createFieldErrors(error);
  }

  redirectToEditWithToast(documentRecordId, "Hujjat saqlandi.");
}

export async function publishDocumentRecordAction(documentRecordId: string) {
  const trimmedId = documentRecordId.trim();
  if (!trimmedId) {
    throw new Error("Hujjat yozuvi identifikatori yetishmayapti.");
  }

  await publishDocumentRecord(trimmedId);
  revalidateDocumentRecordRoutes(trimmedId);
  redirectToEditWithToast(trimmedId, "Hujjat e'lon qilindi.");
}

export async function revokeDocumentRecordAction(
  documentRecordId: string,
  formData: FormData
) {
  const trimmedId = documentRecordId.trim();
  if (!trimmedId) {
    throw new Error("Hujjat yozuvi identifikatori yetishmayapti.");
  }

  const revokedReason = String(formData.get("revokedReason") ?? "").trim();

  await revokeDocumentRecord(trimmedId, revokedReason || null);
  revalidateDocumentRecordRoutes(trimmedId);
  redirectToEditWithToast(trimmedId, "Hujjat bekor qilindi.");
}

export async function expireDocumentRecordAction(documentRecordId: string) {
  const trimmedId = documentRecordId.trim();
  if (!trimmedId) {
    throw new Error("Hujjat yozuvi identifikatori yetishmayapti.");
  }

  await expireDocumentRecord(trimmedId);
  revalidateDocumentRecordRoutes(trimmedId);
  redirectToEditWithToast(trimmedId, "Hujjat muddati tugagan deb belgilandi.");
}

export async function returnDocumentRecordToDraftAction(documentRecordId: string) {
  const trimmedId = documentRecordId.trim();
  if (!trimmedId) {
    throw new Error("Hujjat yozuvi identifikatori yetishmayapti.");
  }

  await returnDocumentRecordToDraft(trimmedId);
  revalidateDocumentRecordRoutes(trimmedId);
  redirectToEditWithToast(trimmedId, "Hujjat qoralamaga qaytarildi.");
}

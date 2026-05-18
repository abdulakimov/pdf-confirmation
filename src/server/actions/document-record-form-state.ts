import type { DocumentRecordInput } from "@/lib/validators";

export type DocumentRecordFormState = {
  formError: string | null;
  fieldErrors: Partial<Record<keyof DocumentRecordInput, string>>;
  createdDocumentRecordId: string | null;
};

export const initialDocumentRecordFormState: DocumentRecordFormState = {
  formError: null,
  fieldErrors: {},
  createdDocumentRecordId: null
};

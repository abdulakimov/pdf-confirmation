"use client";

import type { ReactNode } from "react";
import { useActionState, useId } from "react";
import { Upload } from "lucide-react";

import { DocumentFileUploadForm } from "@/components/admin/document-file-upload-form";
import { documentStatusValues } from "@/lib/validators";
import type { DocumentRecordInput } from "@/lib/validators";
import { initialDocumentRecordFormState } from "@/server/actions/document-record-form-state";
import type { DocumentRecordFormState } from "@/server/actions/document-record-form-state";

const fieldClassName =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900";

const fileButtonClassName =
  "inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm font-medium text-slate-900 transition hover:border-slate-400 hover:bg-slate-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-50 disabled:text-slate-400";

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="text-sm text-rose-600">{message}</p>;
}

type DocumentRecordFormProps = {
  action: (
    state: DocumentRecordFormState,
    formData: FormData
  ) => Promise<DocumentRecordFormState>;
  initialValues: {
    title: string;
    fullName: string;
    passport: string;
    issuedDate: string;
    status: DocumentRecordInput["status"];
  };
  documentRecordId?: string;
  showFileUpload?: boolean;
  requireFileUpload?: boolean;
  maxPdfMb?: number;
  showStatusSelect?: boolean;
  submitIcon?: ReactNode;
  submitLabel: string;
  showPostCreateUpload?: boolean;
};

const statusLabels: Record<DocumentRecordInput["status"], string> = {
  DRAFT: "Qoralama",
  VERIFIED: "Tasdiqlangan",
  REVOKED: "Bekor qilingan",
  EXPIRED: "Muddati tugagan"
};

export function DocumentRecordForm({
  action,
  initialValues,
  documentRecordId,
  maxPdfMb = 20,
  showFileUpload = false,
  requireFileUpload = false,
  showStatusSelect = true,
  submitIcon,
  submitLabel,
  showPostCreateUpload = false
}: DocumentRecordFormProps) {
  const titleId = useId();
  const fullNameId = useId();
  const passportId = useId();
  const issuedDateId = useId();
  const statusId = useId();
  const filesId = useId();
  const [state, formAction, isPending] = useActionState(
    action,
    initialDocumentRecordFormState
  );
  const createdDocumentRecordId = state.createdDocumentRecordId?.trim() || null;
  const isLockedAfterCreate = Boolean(createdDocumentRecordId);

  return (
    <div className="space-y-6">
      <form action={formAction} className="space-y-6" encType="multipart/form-data">
        {documentRecordId ? (
          <input name="documentRecordId" type="hidden" value={documentRecordId} />
        ) : null}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-slate-700" htmlFor={titleId}>
              Sarlavha
            </label>
            <input
              className={fieldClassName}
              defaultValue={initialValues.title}
              disabled={isLockedAfterCreate}
              id={titleId}
              name="title"
              type="text"
              placeholder="Sertifikat sarlavhasi"
            />
            <FieldError message={state.fieldErrors.title} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor={fullNameId}>
              F.I.O
            </label>
            <input
              className={fieldClassName}
              defaultValue={initialValues.fullName}
              disabled={isLockedAfterCreate}
              id={fullNameId}
              name="fullName"
              type="text"
              placeholder="Hujjat egasining F.I.O"
            />
            <FieldError message={state.fieldErrors.fullName} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor={passportId}>
              Pasport
            </label>
            <input
              className={fieldClassName}
              defaultValue={initialValues.passport}
              disabled={isLockedAfterCreate}
              id={passportId}
              name="passport"
              type="text"
              placeholder="AA1234567"
            />
            <FieldError message={state.fieldErrors.passport} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor={issuedDateId}>
              Sana
            </label>
            <input
              className={fieldClassName}
              defaultValue={initialValues.issuedDate}
              disabled={isLockedAfterCreate}
              id={issuedDateId}
              name="issuedDate"
              type="date"
            />
            <FieldError message={state.fieldErrors.issuedDate} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor={statusId}>
              Holat
            </label>
            {showStatusSelect ? (
              <select
                className={fieldClassName}
                defaultValue={initialValues.status}
                disabled={isLockedAfterCreate}
                id={statusId}
                name="status"
              >
                {documentStatusValues.map((status) => (
                  <option key={status} value={status}>
                    {statusLabels[status]}
                  </option>
                ))}
              </select>
            ) : (
              <>
                <input name="status" type="hidden" value={initialValues.status} />
                <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                  {statusLabels[initialValues.status]}
                </p>
              </>
            )}
            <FieldError message={state.fieldErrors.status} />
          </div>
        </div>

        {showFileUpload ? (
          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-700" htmlFor={filesId}>
              PDF fayllar
            </label>
            <input
              className="sr-only"
              id={filesId}
              name="files"
              type="file"
              accept="application/pdf"
              disabled={isLockedAfterCreate}
              multiple
              required={requireFileUpload}
            />
            <label className={fileButtonClassName} htmlFor={filesId}>
              <Upload aria-hidden className="h-4 w-4" />
              PDF fayllarni yuklash
            </label>
            <p className="text-xs leading-5 text-slate-500">
              {requireFileUpload
                ? "Hozir kamida bitta PDF fayl yuklang. Fayllarni keyin tahrirlash sahifasidan ham boshqarishingiz mumkin."
                : "Hozir bir yoki bir nechta PDF fayl yuklang. Fayllarni keyin tahrirlash sahifasidan ham boshqarishingiz mumkin."}{" "}
              Har bir fayl uchun maksimal hajm: {maxPdfMb} MB.
            </p>
          </div>
        ) : null}

        {state.formError ? (
          <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {state.formError}
          </p>
        ) : null}

        {isLockedAfterCreate ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-800">
            Hujjat yaratildi. Endi PDF fayllarni pastdagi yuklash bo&apos;limidan yuklang.
          </div>
        ) : null}

        <button
          className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isPending || isLockedAfterCreate}
          type="submit"
        >
          {!isPending && submitIcon ? submitIcon : null}
          {isPending
            ? "Saqlanmoqda..."
            : isLockedAfterCreate
              ? "Yaratildi"
              : submitLabel}
        </button>
      </form>

      {showPostCreateUpload && createdDocumentRecordId ? (
        <section className="border-t border-slate-200 pt-6">
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-900">PDF fayllarni yuklash</p>
            <p className="text-sm leading-6 text-slate-600">
              PDF fayllarni yaratgan hujjatga alohida va tezkor yuklang.
            </p>
          </div>
          <div className="mt-4">
            <DocumentFileUploadForm
              documentRecordId={createdDocumentRecordId}
              maxPdfMb={maxPdfMb}
            />
          </div>
        </section>
      ) : null}
    </div>
  );
}

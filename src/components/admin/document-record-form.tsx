"use client";

import { useActionState, useId } from "react";

import { documentStatusValues } from "@/lib/validators";
import type { DocumentRecordInput } from "@/lib/validators";
import { initialDocumentRecordFormState } from "@/server/actions/document-record-form-state";
import type { DocumentRecordFormState } from "@/server/actions/document-record-form-state";

const fieldClassName =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900";

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
    stampImageKey: string;
  };
  documentRecordId?: string;
  submitLabel: string;
};

export function DocumentRecordForm({
  action,
  initialValues,
  documentRecordId,
  submitLabel
}: DocumentRecordFormProps) {
  const titleId = useId();
  const fullNameId = useId();
  const passportId = useId();
  const issuedDateId = useId();
  const statusId = useId();
  const stampImageKeyId = useId();
  const [state, formAction, isPending] = useActionState(
    action,
    initialDocumentRecordFormState
  );

  return (
    <form action={formAction} className="space-y-6">
      {documentRecordId ? (
        <input name="documentRecordId" type="hidden" value={documentRecordId} />
      ) : null}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium text-slate-700" htmlFor={titleId}>
            Title
          </label>
          <input
            className={fieldClassName}
            defaultValue={initialValues.title}
            id={titleId}
            name="title"
            type="text"
            placeholder="Certificate title"
          />
          <FieldError message={state.fieldErrors.title} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor={fullNameId}>
            Full name
          </label>
          <input
            className={fieldClassName}
            defaultValue={initialValues.fullName}
            id={fullNameId}
            name="fullName"
            type="text"
            placeholder="Document owner full name"
          />
          <FieldError message={state.fieldErrors.fullName} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor={passportId}>
            Passport
          </label>
          <input
            className={fieldClassName}
            defaultValue={initialValues.passport}
            id={passportId}
            name="passport"
            type="text"
            placeholder="AA1234567"
          />
          <FieldError message={state.fieldErrors.passport} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor={issuedDateId}>
            Issued date
          </label>
          <input
            className={fieldClassName}
            defaultValue={initialValues.issuedDate}
            id={issuedDateId}
            name="issuedDate"
            type="date"
          />
          <FieldError message={state.fieldErrors.issuedDate} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor={statusId}>
            Status
          </label>
          <select
            className={fieldClassName}
            defaultValue={initialValues.status}
            id={statusId}
            name="status"
          >
            {documentStatusValues.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <FieldError message={state.fieldErrors.status} />
        </div>
        <div className="space-y-2 md:col-span-2">
          <label
            className="text-sm font-medium text-slate-700"
            htmlFor={stampImageKeyId}
          >
            Stamp image key
          </label>
          <input
            className={fieldClassName}
            defaultValue={initialValues.stampImageKey}
            id={stampImageKeyId}
            name="stampImageKey"
            type="text"
            placeholder="Optional storage key for an uploaded stamp image"
          />
          <FieldError message={state.fieldErrors.stampImageKey} />
        </div>
      </div>

      {state.formError ? (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {state.formError}
        </p>
      ) : null}

      <button
        className="inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isPending}
        type="submit"
      >
        {isPending ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}
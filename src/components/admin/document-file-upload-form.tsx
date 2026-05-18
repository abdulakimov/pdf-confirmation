"use client";

import { useActionState, useId } from "react";

import { initialDocumentFileUploadState } from "@/server/actions/document-file-upload-state";
import type { DocumentFileUploadState } from "@/server/actions/document-file-upload-state";

const fieldClassName =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-1 file:text-sm file:font-medium placeholder:text-slate-400 focus:border-slate-900";

type DocumentFileUploadFormProps = {
  action: (
    state: DocumentFileUploadState,
    formData: FormData
  ) => Promise<DocumentFileUploadState>;
  maxPdfMb: number;
};

export function DocumentFileUploadForm({ action, maxPdfMb }: DocumentFileUploadFormProps) {
  const filesId = useId();
  const [state, formAction, isPending] = useActionState(
    action,
    initialDocumentFileUploadState
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700" htmlFor={filesId}>
          Upload PDFs
        </label>
        <input
          className={fieldClassName}
          id={filesId}
          name="files"
          type="file"
          accept="application/pdf,.pdf"
          multiple
        />
        <p className="text-xs leading-5 text-slate-500">
          Only PDF files are allowed. Maximum file size: {maxPdfMb} MB per file.
        </p>
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
        {isPending ? "Uploading..." : "Upload PDFs"}
      </button>
    </form>
  );
}
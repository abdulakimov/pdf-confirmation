import Link from "next/link";
import { notFound } from "next/navigation";

import {
  DocumentFileList,
  DocumentFileUploadForm,
  DocumentPublicVerificationCard,
  DocumentRecordForm,
  DocumentStatusBadge
} from "@/components/admin";
import {
  revokeDocumentRecordAction,
  updateDocumentRecordAction,
  uploadDocumentFilesAction
} from "@/server/actions";
import { getDocumentRecordById } from "@/server/services";

export const dynamic = "force-dynamic";

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

function formatDate(value: Date | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(value);
}

function getMaxPdfMb() {
  const parsed = Number(process.env.MAX_PDF_MB ?? "20");
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 20;
}

export default async function EditDocumentRecordPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const record = await getDocumentRecordById(id);

  if (!record) {
    notFound();
  }

  const maxPdfMb = getMaxPdfMb();

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
            Edit document record
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">
            {record.title}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Update metadata, manage uploaded PDFs, and control the public
            verification link. PDF and QR workflows stay admin-only here.
          </p>
        </div>
        <Link
          className="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-50"
          href="/admin/documents"
        >
          Back to records
        </Link>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <section className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <DocumentRecordForm
            action={updateDocumentRecordAction}
            documentRecordId={record.id}
            initialValues={{
              title: record.title,
              fullName: record.fullName,
              passport: record.passport,
              issuedDate: toDateInputValue(record.issuedDate),
              status: record.status,
              stampImageKey: record.stampImageKey ?? ""
            }}
            submitLabel="Save changes"
          />

          <div className="border-t border-slate-200 pt-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-900">Uploaded PDFs</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Upload one or more PDF files for this record. Files are stored
                  in order and public routes become available only when the
                  record is VERIFIED.
                </p>
              </div>
            </div>

            <div className="mt-4">
              <DocumentFileUploadForm
                action={uploadDocumentFilesAction.bind(null, record.id)}
                maxPdfMb={maxPdfMb}
              />
            </div>

            <div className="mt-6">
              <DocumentFileList
                documentRecordId={record.id}
                publicToken={record.publicToken}
                files={record.files}
              />
            </div>
          </div>

          <div className="border-t border-slate-200 pt-6">
            <p className="text-sm font-medium text-slate-900">Revoke record</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Revoking marks the record as invalid and keeps a timestamped
              audit trail.
            </p>
            <form
              className="mt-4"
              action={revokeDocumentRecordAction.bind(null, record.id)}
            >
              <button
                className="inline-flex items-center rounded-full bg-rose-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-700"
                type="submit"
              >
                Revoke record
              </button>
            </form>
          </div>
        </section>

        <aside className="space-y-4">
          <DocumentPublicVerificationCard
            documentRecordId={record.id}
            publicToken={record.publicToken}
          />

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Status
              </p>
              <div className="mt-2">
                <DocumentStatusBadge status={record.status} />
              </div>
            </div>

            <div className="mt-4 space-y-2 text-sm text-slate-600">
              <p>
                <span className="font-medium text-slate-900">Published:</span>{" "}
                {formatDate(record.publishedAt)}
              </p>
              <p>
                <span className="font-medium text-slate-900">Revoked:</span>{" "}
                {formatDate(record.revokedAt)}
              </p>
              <p>
                <span className="font-medium text-slate-900">Updated:</span>{" "}
                {formatDate(record.updatedAt)}
              </p>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
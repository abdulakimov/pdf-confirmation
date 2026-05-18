import Link from "next/link";

import { DocumentRecordForm } from "@/components/admin/document-record-form";
import { createDocumentRecordAction } from "@/server/actions/documents";

export default function NewDocumentRecordPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl px-6 py-10">
      <div className="mb-8">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
          New document record
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">
          Create metadata record
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          Enter the document metadata that will later appear on the public
          verification page.
        </p>
        <div className="mt-4 flex gap-3">
          <Link
            className="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-50"
            href="/admin/documents"
          >
            Back to records
          </Link>
        </div>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <DocumentRecordForm
          action={createDocumentRecordAction}
          initialValues={{
            title: "",
            fullName: "",
            passport: "",
            issuedDate: "",
            status: "DRAFT",
            stampImageKey: ""
          }}
          submitLabel="Create record"
        />
      </section>
    </main>
  );
}
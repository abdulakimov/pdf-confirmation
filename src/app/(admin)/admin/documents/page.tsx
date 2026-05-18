import Link from "next/link";

export const dynamic = "force-dynamic";

import { DocumentStatusBadge } from "@/components/admin/document-status-badge";
import { listDocumentRecords } from "@/server/services";

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(value);
}

export default async function DocumentsPage() {
  const records = await listDocumentRecords();

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
            Document management
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">
            Document records
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Manage document metadata only. PDF uploads and QR generation will be
            added in later slices.
          </p>
        </div>
        <Link
          className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
          href="/admin/documents/new"
        >
          Create record
        </Link>
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {records.length > 0 ? (
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr className="text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Owner</th>
                <th className="px-4 py-3">Passport</th>
                <th className="px-4 py-3">Issued</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Updated</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {records.map((record) => (
                <tr key={record.id} className="text-sm text-slate-700">
                  <td className="px-4 py-4 font-medium text-slate-900">
                    {record.title}
                  </td>
                  <td className="px-4 py-4">{record.fullName}</td>
                  <td className="px-4 py-4 font-mono">{record.passport}</td>
                  <td className="px-4 py-4">{formatDate(record.issuedDate)}</td>
                  <td className="px-4 py-4">
                    <DocumentStatusBadge status={record.status} />
                  </td>
                  <td className="px-4 py-4">{formatDate(record.updatedAt)}</td>
                  <td className="px-4 py-4 text-right">
                    <Link
                      className="inline-flex items-center rounded-full border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-900 transition hover:bg-slate-50"
                      href={`/admin/documents/${record.id}/edit`}
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-8 text-sm text-slate-600">
            No document records yet. Create the first record to start managing
            verification metadata.
          </div>
        )}
      </div>
    </main>
  );
}
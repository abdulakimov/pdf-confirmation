"use client";

import { useRouter } from "next/navigation";
import type { KeyboardEvent } from "react";

import type { DocumentRecord } from "@prisma/client";
import { FileText } from "lucide-react";

import { DocumentStatusBadge } from "@/components/admin/document-status-badge";

type DocumentRecordsTableProps = {
  records: DocumentRecord[];
};

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("uz-UZ", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(value);
}

export function DocumentRecordsTable({ records }: DocumentRecordsTableProps) {
  const router = useRouter();

  function openEditPage(recordId: string) {
    router.push(`/admin/documents/${recordId}/edit`);
  }

  function handleKeyDown(
    event: KeyboardEvent<HTMLTableRowElement>,
    recordId: string
  ) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openEditPage(recordId);
    }
  }

  return (
    <table className="min-w-full divide-y divide-slate-200">
      <thead className="bg-slate-50">
        <tr className="text-left text-xs font-semibold text-slate-500">
          <th className="px-4 py-3">Sarlavha</th>
          <th className="px-4 py-3">F.I.O</th>
          <th className="px-4 py-3">Pasport</th>
          <th className="px-4 py-3">Sana</th>
          <th className="px-4 py-3">Holat</th>
          <th className="px-4 py-3">Yangilangan</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-200">
        {records.map((record) => (
          <tr
            key={record.id}
            aria-label={`${record.title} hujjatini tahrirlash`}
            className="cursor-pointer text-sm text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-slate-900"
            role="link"
            tabIndex={0}
            onClick={() => openEditPage(record.id)}
            onKeyDown={(event) => handleKeyDown(event, record.id)}
          >
            <td className="px-4 py-4 font-medium text-slate-900">
              <div className="flex items-center gap-2">
                <FileText aria-hidden className="h-4 w-4 shrink-0 text-slate-500" />
                <span>{record.title}</span>
              </div>
            </td>
            <td className="px-4 py-4">{record.fullName}</td>
            <td className="px-4 py-4 font-mono">{record.passport}</td>
            <td className="px-4 py-4">{formatDate(record.issuedDate)}</td>
            <td className="px-4 py-4">
              <DocumentStatusBadge status={record.status} />
            </td>
            <td className="px-4 py-4">{formatDate(record.updatedAt)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

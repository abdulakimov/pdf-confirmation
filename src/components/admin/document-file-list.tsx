import Link from "next/link";

import type { DocumentFile } from "@prisma/client";
import { Download, Eye, FileText, Trash2 } from "lucide-react";

import { deleteDocumentFileAction } from "@/server/actions/document-files";

function formatBytes(sizeBytes: number) {
  if (sizeBytes < 1024) {
    return `${sizeBytes} B`;
  }

  const units = ["KB", "MB", "GB"] as const;
  let value = sizeBytes / 1024;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[unitIndex]}`;
}

type DocumentFileListProps = {
  documentRecordId: string;
  publicToken: string;
  files: DocumentFile[];
};

export function DocumentFileList({ documentRecordId, publicToken, files }: DocumentFileListProps) {
  if (files.length === 0) {
    return (
      <p className="text-sm leading-6 text-slate-600">
        Hali PDF fayllar yuklanmagan.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {files.map((file) => {
        const publicViewHref = `/verify/${publicToken}/files/${file.id}/view`;
        const publicDownloadHref = `/verify/${publicToken}/files/${file.id}/download`;

        return (
          <li
            key={file.id}
            className="rounded-xl border border-slate-200 bg-slate-50 p-4"
          >
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-1">
                <p className="flex items-center gap-2 text-sm font-medium text-slate-900">
                  <FileText aria-hidden className="h-4 w-4 text-slate-500" />
                  {file.sortOrder + 1}. {file.originalName}
                </p>
                <p className="text-xs leading-5 text-slate-500">
                  {file.mimeType} | {formatBytes(file.sizeBytes)} | xesh {file.checksum.slice(0, 12)}...
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Link
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-900 transition hover:bg-slate-100"
                  href={publicViewHref}
                >
                  <Eye aria-hidden className="h-3.5 w-3.5" />
                  Ko&apos;rish
                </Link>
                <Link
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-900 transition hover:bg-slate-100"
                  href={publicDownloadHref}
                >
                  <Download aria-hidden className="h-3.5 w-3.5" />
                  Yuklab olish
                </Link>
                <form action={deleteDocumentFileAction.bind(null, documentRecordId, file.id)}>
                  <button
                    className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-white px-3 py-1.5 text-xs font-medium text-rose-700 transition hover:bg-rose-50"
                    type="submit"
                  >
                    <Trash2 aria-hidden className="h-3.5 w-3.5" />
                    O&apos;chirish
                  </button>
                </form>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

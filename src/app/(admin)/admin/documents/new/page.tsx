import Link from "next/link";
import { ArrowLeft, FilePlus } from "lucide-react";

import { DocumentRecordForm } from "@/components/admin/document-record-form";
import { createDocumentRecordAction } from "@/server/actions/documents";

function getMaxPdfMb() {
  const parsed = Number(process.env.MAX_PDF_MB ?? "20");
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 20;
}

export default function NewDocumentRecordPage() {
  const maxPdfMb = getMaxPdfMb();

  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl px-6 py-10">
      <div className="mb-8">
        <p className="text-sm font-medium text-slate-500">
          Yangi hujjat
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">
          Hujjatni yarating va PDF fayllarni yuklang
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          Hujjat metama&apos;lumotlarini kiriting va avval yozuvni yarating. So&apos;ng
          PDF fayllarni xuddi tahrirlash sahifasidagi kabi alohida yuklash
          bo&apos;limidan yuklang.
        </p>
        <div className="mt-4 flex gap-3">
          <Link
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-50"
            href="/"
          >
            <ArrowLeft aria-hidden className="h-4 w-4" />
            Ro&apos;yxatga qaytish
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
            status: "DRAFT"
          }}
          maxPdfMb={maxPdfMb}
          showPostCreateUpload
          submitIcon={<FilePlus aria-hidden className="h-4 w-4" />}
          submitLabel="Yaratish"
        />
      </section>
    </main>
  );
}

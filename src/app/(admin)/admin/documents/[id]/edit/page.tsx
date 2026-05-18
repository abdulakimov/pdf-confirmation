import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BadgeCheck, FilePenLine, FileText, Save } from "lucide-react";

import {
  AdminToast,
  DocumentFileList,
  DocumentFileUploadForm,
  DocumentPublicVerificationCard,
  DocumentRecordForm,
  DocumentStampUploadForm,
  DocumentStatusActions,
  DocumentStatusBadge
} from "@/components/admin";
import {
  expireDocumentRecordAction,
  publishDocumentRecordAction,
  returnDocumentRecordToDraftAction,
  revokeDocumentRecordAction,
  updateDocumentRecordAction,
  removeDocumentStampImageAction
} from "@/server/actions";
import {
  getDocumentRecordById,
  getDocumentStampMaxImageMb,
  readDocumentStampImageDataUrl
} from "@/server/services";

export const dynamic = "force-dynamic";

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

function formatDate(value: Date | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("uz-UZ", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(value);
}

function getMaxPdfMb() {
  const parsed = Number(process.env.MAX_PDF_MB ?? "20");
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 20;
}

export default async function EditDocumentRecordPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ toast?: string; toastKind?: string }>;
}) {
  const { id } = await params;
  const record = await getDocumentRecordById(id);

  if (!record) {
    notFound();
  }

  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const toastMessage = resolvedSearchParams?.toast?.trim() || null;
  const toastKind =
    resolvedSearchParams?.toastKind === "error"
      ? "error"
      : resolvedSearchParams?.toastKind === "info"
        ? "info"
        : "success";

  const maxPdfMb = getMaxPdfMb();
  const maxStampImageMb = getDocumentStampMaxImageMb();
  const stampImageDataUrl = await readDocumentStampImageDataUrl(
    record.stampImageKey
  );

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-10">
      {toastMessage ? <AdminToast kind={toastKind} message={toastMessage} /> : null}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="flex items-center gap-2 text-sm font-medium text-slate-500">
            <FilePenLine aria-hidden className="h-4 w-4" />
            Hujjatni tahrirlash
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">
            {record.title}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Metama&apos;lumotlarni yangilang, holat amallarini boshqaring va ommaviy
            tasdiqlash havolasini nazorat qiling. PDF va QR ish jarayonlari faqat
            admin uchun qoladi.
          </p>
        </div>
        <Link
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-50"
          href="/"
        >
          <ArrowLeft aria-hidden className="h-4 w-4" />
          Ro&apos;yxatga qaytish
        </Link>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <DocumentStatusActions
            expireAction={expireDocumentRecordAction.bind(null, record.id)}
            publishAction={publishDocumentRecordAction.bind(null, record.id)}
            revokeAction={revokeDocumentRecordAction.bind(null, record.id)}
            returnToDraftAction={returnDocumentRecordToDraftAction.bind(null, record.id)}
            status={record.status}
          />

          <DocumentStampUploadForm
            documentRecordId={record.id}
            maxStampImageMb={maxStampImageMb}
            removeAction={removeDocumentStampImageAction.bind(null, record.id)}
            stampImageDataUrl={stampImageDataUrl}
          />

          <div className="border-t border-slate-200 pt-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="flex items-center gap-2 text-sm font-medium text-slate-900">
                  <FileText aria-hidden className="h-4 w-4 text-slate-500" />
                  Yuklangan PDF fayllar
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Ushbu hujjat uchun bir yoki bir nechta PDF fayl yuklang.
                  Fayllar tartib bilan saqlanadi va ommaviy sahifalar faqat
                  hujjat tasdiqlangan bo&apos;lganda ochiladi.
                </p>
              </div>
            </div>

            <div className="mt-4">
              <DocumentFileUploadForm
                documentRecordId={record.id}
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
            <DocumentRecordForm
              action={updateDocumentRecordAction}
              documentRecordId={record.id}
              initialValues={{
                title: record.title,
                fullName: record.fullName,
                passport: record.passport,
                issuedDate: toDateInputValue(record.issuedDate),
                status: record.status
              }}
              showStatusSelect={false}
              submitIcon={<Save aria-hidden className="h-4 w-4" />}
              submitLabel="Saqlash"
            />
          </div>
        </section>

        <aside className="space-y-4">
          <DocumentPublicVerificationCard
            documentRecordId={record.id}
            publicToken={record.publicToken}
          />

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div>
              <p className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                <BadgeCheck aria-hidden className="h-3.5 w-3.5" />
                Holat
              </p>
              <div className="mt-2">
                <DocumentStatusBadge status={record.status} />
              </div>
            </div>

            <dl className="mt-4 space-y-3 text-sm text-slate-600">
              <div className="space-y-1">
                <dt className="font-medium text-slate-900">E&apos;lon qilingan</dt>
                <dd>{formatDate(record.publishedAt)}</dd>
              </div>
              <div className="space-y-1">
                <dt className="font-medium text-slate-900">Bekor qilingan</dt>
                <dd>{formatDate(record.revokedAt)}</dd>
              </div>
              <div className="space-y-1">
                <dt className="font-medium text-slate-900">Bekor qilish sababi</dt>
                <dd>{record.revokedReason?.trim() ? record.revokedReason : "-"}</dd>
              </div>
              <div className="space-y-1">
                <dt className="font-medium text-slate-900">Yangilangan</dt>
                <dd>{formatDate(record.updatedAt)}</dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>
    </main>
  );
}

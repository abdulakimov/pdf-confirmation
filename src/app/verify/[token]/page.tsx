import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, Download, Eye, FileText } from "lucide-react";

import { prisma } from "@/lib/db";
import { readDocumentStampImageDataUrl } from "@/server/services";

export const dynamic = "force-dynamic";

type VerifyPageProps = {
  params: Promise<{
    token: string;
  }>;
};

function formatIssuedDate(date: Date) {
  return new Intl.DateTimeFormat("uz-UZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(date);
}

function formatFileSize(sizeBytes: number) {
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

function formatUploadedTime(date: Date) {
  return new Intl.DateTimeFormat("uz-UZ", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

function buildFileHref(token: string, fileId: string, mode: "view" | "download") {
  return `/verify/${token}/files/${fileId}/${mode}`;
}

function VerificationLabel({
  label,
  value
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <p className="shrink-0 text-[17px] font-medium leading-7 text-slate-400">
        {label}
      </p>
      <p className="min-w-0 break-words whitespace-normal text-[17px] font-semibold leading-7 text-slate-900 sm:text-[18px]">
        {value}
      </p>
    </div>
  );
}

function InvalidVerificationPage({
  badge,
  title,
  description,
  toneClassName
}: {
  badge: string;
  title: string;
  description: string;
  toneClassName: string;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-8">
      <section className="w-full max-w-[520px] rounded-[28px] border border-slate-200 bg-white px-5 py-8 text-center shadow-sm sm:px-8">
        <p className="text-[11px] font-semibold text-slate-500">
          Tekshiruv
        </p>
        <div className={`mt-4 rounded-[24px] border px-4 py-4 ${toneClassName}`}>
          <p className="text-[11px] font-semibold text-current">
            {badge}
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-[28px]">
            {title}
          </h1>
        </div>
        <p className="mt-4 text-sm leading-6 text-slate-600">{description}</p>
      </section>
    </main>
  );
}

function VerifiedVerificationPage({
  token,
  record,
  stampImageDataUrl
}: {
  token: string;
  record: {
    title: string;
    fullName: string;
    passport: string;
    issuedDate: Date;
    files: Array<{
      id: string;
      originalName: string;
      createdAt: Date;
      sizeBytes: number;
    }>;
  };
  stampImageDataUrl: string | null;
}) {
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 sm:px-6 sm:py-8">
      <section className="mx-auto w-full max-w-[720px] rounded-[30px] border border-emerald-200 bg-white px-4 py-4 shadow-sm sm:px-6 sm:py-6">
        <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 px-4 py-4 text-center">
          <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <CheckCircle2 aria-hidden className="h-4 w-4" />
          </div>
          <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-emerald-700">
            HUJJAT HAQIQIY
          </p>
          <p className="mt-1 text-sm font-medium text-emerald-800">
            Mazkur hujjat tizim orqali tasdiqlangan.
          </p>
        </div>

        <div className="px-2 pt-6 text-center">
          <h1 className="text-[28px] font-semibold leading-tight tracking-tight text-slate-900 sm:text-[34px]">
            {record.title}
          </h1>
          <p className="mt-2 text-sm font-medium text-emerald-700">
            Ushbu hujjat tizimda ro&apos;yxatdan o&apos;tgan va haqiqiy hisoblanadi.
          </p>
        </div>

        <div className="mt-6 text-center">
          <div className="mx-auto flex w-full max-w-md flex-col gap-4 text-left sm:gap-5">
            <VerificationLabel label="F.I.O:" value={record.fullName} />
            <VerificationLabel label="Passport:" value={record.passport} />
            <VerificationLabel label="Sana:" value={formatIssuedDate(record.issuedDate)} />
          </div>
        </div>

        <div className="my-6 h-px bg-slate-200" />

        <div className="space-y-4">
          {record.files.length > 0 ? (
            <>
              <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white md:block">
                <table className="w-full border-collapse text-left">
                  <thead className="bg-slate-50">
                    <tr className="border-b border-slate-200 text-xs font-medium text-slate-500">
                      <th className="px-4 py-3">Fayl nomi</th>
                      <th className="px-4 py-3">Fayl hajmi</th>
                      <th className="px-4 py-3">Yuklangan vaqti</th>
                      <th className="px-4 py-3 text-right">Amallar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {record.files.map((file) => (
                      <tr key={file.id} className="border-b border-slate-100 last:border-b-0">
                        <td className="px-4 py-3">
                          <div className="flex items-start gap-2">
                            <FileText aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                            <span className="min-w-0 break-words text-sm font-medium text-slate-900">
                              {file.originalName}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {formatFileSize(file.sizeBytes)}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {formatUploadedTime(file.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              aria-label={`Ko'rish: ${file.originalName}`}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                              href={buildFileHref(token, file.id, "view")}
                              title="Ko'rish"
                            >
                              <Eye aria-hidden className="h-4 w-4" />
                            </Link>
                            <Link
                              aria-label={`Yuklab olish: ${file.originalName}`}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                              href={buildFileHref(token, file.id, "download")}
                              title="Yuklab olish"
                            >
                              <Download aria-hidden className="h-4 w-4" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="space-y-3 md:hidden">
                {record.files.map((file) => (
                  <article
                    key={file.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4"
                  >
                    <div className="flex items-start gap-2">
                      <FileText aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                      <div className="min-w-0">
                        <p className="break-words text-sm font-medium text-slate-900">
                          {file.originalName}
                        </p>
                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          {formatFileSize(file.sizeBytes)} · {formatUploadedTime(file.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <Link
                        aria-label={`Ko'rish: ${file.originalName}`}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                        href={buildFileHref(token, file.id, "view")}
                        title="Ko'rish"
                      >
                        <Eye aria-hidden className="h-4 w-4" />
                      </Link>
                      <Link
                        aria-label={`Yuklab olish: ${file.originalName}`}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                        href={buildFileHref(token, file.id, "download")}
                        title="Yuklab olish"
                      >
                        <Download aria-hidden className="h-4 w-4" />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </>
          ) : (
            <p className="text-center text-sm leading-6 text-slate-500">
              Biriktirilgan PDF fayllar yo&apos;q.
            </p>
          )}
        </div>

        {stampImageDataUrl ? (
          <>
            <div className="my-6 h-px bg-slate-200" />
            <div className="flex justify-center">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 px-6 py-5">
                <Image
                  alt="Muhr yoki seal"
                  className="max-h-40 w-auto max-w-full object-contain"
                  height={160}
                  unoptimized
                  src={stampImageDataUrl}
                  width={320}
                />
              </div>
            </div>
          </>
        ) : null}
      </section>
    </main>
  );
}

function getInvalidState(status?: string | null) {
  switch (status) {
    case "DRAFT":
      return {
        badge: "Qoralama",
        title: "Hujjat e'lon qilinmagan",
        description:
          "Bu havola bo'yicha hujjat mavjud, lekin u hali ommaviy tekshiruvga chiqarilmagan.",
        toneClassName: "border-slate-200 bg-slate-50 text-slate-700"
      };
    case "REVOKED":
      return {
        badge: "Bekor qilingan",
        title: "Hujjat bekor qilingan",
        description:
          "Bu havola bo'yicha hujjat topildi, lekin u bekor qilingan va endi haqiqiy emas.",
        toneClassName: "border-rose-200 bg-rose-50 text-rose-700"
      };
    case "EXPIRED":
      return {
        badge: "Muddati tugagan",
        title: "Hujjat muddati tugagan",
        description:
          "Bu havola bo'yicha hujjat topildi, lekin uning amal qilish muddati tugagan.",
        toneClassName: "border-amber-200 bg-amber-50 text-amber-700"
      };
    default:
      return {
        badge: "Yaroqsiz",
        title: "Hujjat topilmadi yoki yaroqsiz",
        description:
          "Bu havola bo'yicha tasdiqlangan yozuv mavjud emas yoki u yaroqsiz.",
        toneClassName: "border-slate-200 bg-slate-50 text-slate-700"
      };
  }
}

export default async function VerifyTokenPage({ params }: VerifyPageProps) {
  const { token } = await params;

  const record = await prisma.documentRecord.findUnique({
    where: { publicToken: token },
    include: {
      files: {
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }]
      }
    }
  });

  if (!record || record.status !== "VERIFIED") {
    const invalidState = getInvalidState(record?.status);
    return <InvalidVerificationPage {...invalidState} />;
  }

  const stampImageDataUrl = await readDocumentStampImageDataUrl(
    record.stampImageKey
  );

  return (
    <VerifiedVerificationPage
      record={record}
      stampImageDataUrl={stampImageDataUrl}
      token={token}
    />
  );
}

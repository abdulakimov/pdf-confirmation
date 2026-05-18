import Image from "next/image";
import Link from "next/link";

import path from "node:path";
import { readFile } from "node:fs/promises";

import { prisma } from "@/lib/db";
import { getLocalUploadRootPath } from "@/lib/storage";

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

function buildFileHref(token: string, fileId: string, mode: "view" | "download") {
  return `/verify/${token}/files/${fileId}/${mode}`;
}

function getImageMimeType(filePath: string) {
  const extension = path.extname(filePath).toLowerCase();

  switch (extension) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".webp":
      return "image/webp";
    case ".gif":
      return "image/gif";
    case ".png":
      return "image/png";
    case ".svg":
      return "image/svg+xml";
    default:
      return null;
  }
}

async function readStampImageDataUrl(stampImageKey: string | null) {
  if (!stampImageKey) {
    return null;
  }

  const uploadRoot = getLocalUploadRootPath();
  const resolvedPath = path.resolve(uploadRoot, stampImageKey);
  const rootWithSeparator = `${uploadRoot}${path.sep}`;

  if (resolvedPath !== uploadRoot && !resolvedPath.startsWith(rootWithSeparator)) {
    return null;
  }

  const mimeType = getImageMimeType(resolvedPath);
  if (!mimeType) {
    return null;
  }

  try {
    const image = await readFile(resolvedPath);
    return `data:${mimeType};base64,${image.toString("base64")}`;
  } catch {
    return null;
  }
}

function VerificationLabel({
  label,
  value
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="space-y-1">
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
        {label}
      </p>
      <p className="text-[17px] font-semibold leading-7 text-slate-900 sm:text-[18px]">
        {value}
      </p>
    </div>
  );
}

function InvalidVerificationPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-8">
      <section className="w-full max-w-[520px] rounded-[28px] border border-slate-200 bg-white px-5 py-8 text-center shadow-sm sm:px-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-slate-500">
          Tekshiruv
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900 sm:text-[28px]">
          Hujjat topilmadi yoki yaroqsiz
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Bu havola bo&apos;yicha tasdiqlangan yozuv mavjud emas yoki u bekor qilingan.
        </p>
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
    }>;
  };
  stampImageDataUrl: string | null;
}) {
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 sm:px-6 sm:py-8">
      <section className="mx-auto w-full max-w-[720px] rounded-[30px] border border-emerald-200 bg-white px-4 py-4 shadow-sm sm:px-6 sm:py-6">
        <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 px-4 py-4 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-emerald-700">
            HUJJAT HAQIQIY
          </p>
          <p className="mt-1 text-sm font-medium text-emerald-800">
            Tasdiqlangan hujjat
          </p>
        </div>

        <div className="px-2 pt-6 text-center">
          <h1 className="text-[28px] font-semibold leading-tight tracking-tight text-slate-900 sm:text-[34px]">
            {record.title}
          </h1>
        </div>

        <div className="mt-6 text-center">
          <div className="grid gap-5 sm:grid-cols-3 sm:gap-4">
            <VerificationLabel label="F.I.O" value={record.fullName} />
            <VerificationLabel label="Passport" value={record.passport} />
            <VerificationLabel label="Sana" value={formatIssuedDate(record.issuedDate)} />
          </div>
        </div>

        <div className="my-6 h-px bg-slate-200" />

        <div className="space-y-4">
          {record.files.length > 0 ? (
            record.files.map((file, index) => (
              <article key={file.id} className="space-y-3">
                <p className="text-center text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                  PDF {index + 1}
                </p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Link
                    className="inline-flex w-full items-center justify-center rounded-2xl border border-emerald-600 bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                    href={buildFileHref(token, file.id, "view")}
                  >
                    Ko&apos;rish
                  </Link>
                  <Link
                    className="inline-flex w-full items-center justify-center rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
                    href={buildFileHref(token, file.id, "download")}
                  >
                    Yuklab olish
                  </Link>
                </div>
                {file.originalName ? (
                  <p className="text-center text-xs leading-5 text-slate-500">
                    {file.originalName}
                  </p>
                ) : null}
              </article>
            ))
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
                  alt="Stamp or seal"
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
    return <InvalidVerificationPage />;
  }

  const stampImageDataUrl = await readStampImageDataUrl(record.stampImageKey);

  return (
    <VerifiedVerificationPage
      record={record}
      stampImageDataUrl={stampImageDataUrl}
      token={token}
    />
  );
}



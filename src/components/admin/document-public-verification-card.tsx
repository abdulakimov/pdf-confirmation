import Image from "next/image";
import Link from "next/link";

import { getPublicVerificationUrl } from "@/lib/qr";

import { CopyToClipboardButton } from "./copy-to-clipboard-button";

type DocumentPublicVerificationCardProps = {
  documentRecordId: string;
  publicToken: string;
};

export function DocumentPublicVerificationCard({
  documentRecordId,
  publicToken
}: DocumentPublicVerificationCardProps) {
  const publicUrl = getPublicVerificationUrl(publicToken);
  const qrPreviewHref = `/admin/documents/${documentRecordId}/qr`;
  const qrDownloadHref = `${qrPreviewHref}?download=1`;
  const publicPreviewHref = `/verify/${publicToken}`;

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          Public verification URL
        </p>
        <p className="mt-2 break-all rounded-lg bg-slate-50 px-3 py-2 font-mono text-sm text-slate-800">
          {publicUrl}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <CopyToClipboardButton value={publicUrl} />
        <Link
          className="inline-flex items-center rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-900 transition hover:bg-slate-100"
          href={publicPreviewHref}
          target="_blank"
          rel="noreferrer"
        >
          Public preview
        </Link>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <Image
          alt={`QR code for ${publicUrl}`}
          className="mx-auto bg-white p-2"
          height={256}
          src={qrPreviewHref}
          unoptimized
          width={256}
        />
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            className="inline-flex items-center rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-900 transition hover:bg-slate-100"
            href={qrDownloadHref}
          >
            Download QR
          </Link>
        </div>
      </div>
    </div>
  );
}
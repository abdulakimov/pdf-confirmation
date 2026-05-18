import { headers } from "next/headers";

import { auth } from "@/lib/auth/auth";
import { generatePublicVerificationQrSvg } from "@/lib/qr";
import { getDocumentRecordById } from "@/server/services";

export const dynamic = "force-dynamic";

async function requireAdmin() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  return Boolean(session && session.user.role === "admin");
}

export async function GET(
  request: Request,
  {
    params
  }: {
    params: Promise<{ id: string }>;
  }
) {
  if (!(await requireAdmin())) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id } = await params;
  const record = await getDocumentRecordById(id);
  if (!record) {
    return new Response("Not found", { status: 404 });
  }

  const qrSvg = await generatePublicVerificationQrSvg(record.publicToken);
  const url = new URL(request.url);
  const isDownload = url.searchParams.get("download") === "1";

  return new Response(qrSvg, {
    headers: {
      "Cache-Control": "no-store",
      "Content-Disposition": `${isDownload ? "attachment" : "inline"}; filename="document-verification-qr.svg"`,
      "Content-Type": "image/svg+xml; charset=utf-8",
      "X-Content-Type-Options": "nosniff"
    }
  });
}
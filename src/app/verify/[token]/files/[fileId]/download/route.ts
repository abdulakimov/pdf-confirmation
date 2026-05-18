import path from "node:path";

import {
  getVerifiedDocumentFileByTokenAndFileId,
  readDocumentFileContent
} from "@/server/services";

export const dynamic = "force-dynamic";

function buildContentDisposition(filename: string, mode: "inline" | "attachment") {
  const safeName = path.basename(filename).replace(/[\r\n"]/g, "_");
  return `${mode}; filename="${safeName}"`;
}

async function streamPdf(token: string, fileId: string, mode: "inline" | "attachment") {
  const fileEntry = await getVerifiedDocumentFileByTokenAndFileId(token, fileId);
  if (!fileEntry) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const content = await readDocumentFileContent(fileEntry.documentFile.storageKey);

    return new Response(content, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": buildContentDisposition(
          fileEntry.documentFile.originalName,
          mode
        ),
        "Content-Length": String(content.byteLength),
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff"
      }
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}

export async function GET(
  _request: Request,
  {
    params
  }: {
    params: Promise<{ fileId: string; token: string }>;
  }
) {
  const { token, fileId } = await params;
  return streamPdf(token, fileId, "attachment");
}
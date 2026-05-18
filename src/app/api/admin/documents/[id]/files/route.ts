import { NextResponse } from "next/server";
import { headers } from "next/headers";

import { auth } from "@/lib/auth/auth";
import { uploadDocumentFiles } from "@/server/services";

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "PDF fayllarni yuklab bo'lmadi.";
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ message: "Kirish rad etildi." }, { status: 401 });
  }

  const { id } = await params;
  const documentRecordId = id.trim();
  if (!documentRecordId) {
    return NextResponse.json({ message: "Hujjat yozuvi identifikatori yetishmayapti." }, { status: 400 });
  }

  try {
    const formData = await request.formData();
    const values = formData.getAll("files");
    const files: File[] = [];

    for (const value of values) {
      if (!(value instanceof File)) {
        return NextResponse.json({ message: "Iltimos, bir yoki bir nechta PDF faylni tanlang." }, { status: 400 });
      }

      files.push(value);
    }

    await uploadDocumentFiles(documentRecordId, files);
    return NextResponse.json({ message: "PDF fayllar yuklandi." });
  } catch (error) {
    return NextResponse.json({ message: getErrorMessage(error) }, { status: 400 });
  }
}

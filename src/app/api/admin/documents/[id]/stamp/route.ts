import { NextResponse } from "next/server";
import { headers } from "next/headers";

import { auth } from "@/lib/auth/auth";
import { uploadDocumentStampImage } from "@/server/services";

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Muhr tasvirini saqlab bo'lmadi.";
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
    const value = formData.get("stampImage");

    if (!(value instanceof File)) {
      return NextResponse.json({ message: "Iltimos, muhr tasvirini tanlang." }, { status: 400 });
    }

    await uploadDocumentStampImage(documentRecordId, value);
    return NextResponse.json({ message: "Muhr tasviri yuklandi." });
  } catch (error) {
    return NextResponse.json({ message: getErrorMessage(error) }, { status: 400 });
  }
}

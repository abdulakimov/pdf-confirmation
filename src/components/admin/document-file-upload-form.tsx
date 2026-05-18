"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Upload } from "lucide-react";
import { useRouter } from "next/navigation";

import { AdminToast } from "@/components/admin/admin-toast";

const uploadButtonClassName =
  "inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm font-medium text-slate-900 transition hover:border-slate-400 hover:bg-slate-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-50 disabled:text-slate-400";

type DocumentFileUploadFormProps = {
  documentRecordId: string;
  maxPdfMb: number;
};

export function DocumentFileUploadForm({ documentRecordId, maxPdfMb }: DocumentFileUploadFormProps) {
  const filesId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [toastKind, setToastKind] = useState<"success" | "error" | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!toastMessage) {
      return;
    }

    const timer = window.setTimeout(() => setToastMessage(null), 4000);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  async function uploadSelectedFiles() {
    const input = fileInputRef.current;
    const selectedFiles = input?.files;

    if (!selectedFiles || selectedFiles.length === 0 || isPending) {
      return;
    }

    const formData = new FormData();
    for (const file of selectedFiles) {
      formData.append("files", file);
    }

    setIsPending(true);
    try {
      const response = await fetch(`/api/admin/documents/${documentRecordId}/files`, {
        method: "POST",
        body: formData
      });

      const payload = (await response.json()) as { message?: string };
      if (!response.ok) {
        throw new Error(payload.message ?? "PDF fayllarni yuklab bo'lmadi.");
      }

      setToastKind("success");
      setToastMessage(payload.message ?? "PDF fayllar yuklandi.");
      router.refresh();
    } catch (error) {
      setToastKind("error");
      setToastMessage(error instanceof Error ? error.message : "PDF fayllarni yuklab bo'lmadi.");
    } finally {
      if (input) {
        input.value = "";
      }
      setIsPending(false);
    }
  }

  return (
    <>
      {toastMessage && toastKind ? <AdminToast kind={toastKind} message={toastMessage} /> : null}

      <div className="space-y-4">
        <input
          ref={fileInputRef}
          className="sr-only"
          id={filesId}
          name="files"
          type="file"
          accept="application/pdf,.pdf"
          multiple
          onChange={() => {
            void uploadSelectedFiles();
          }}
        />

        <button
          className={uploadButtonClassName}
          disabled={isPending}
          type="button"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload aria-hidden className="h-4 w-4" />
          {isPending ? "Yuklanmoqda..." : "PDF fayllarni yuklash"}
        </button>

        <p className="text-xs leading-5 text-slate-500">
          Faqat PDF fayllarga ruxsat beriladi. Har bir fayl uchun maksimal hajm: {maxPdfMb} MB.
        </p>
      </div>
    </>
  );
}

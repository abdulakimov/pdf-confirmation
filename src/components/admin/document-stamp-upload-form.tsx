"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Stamp, Trash2, Upload } from "lucide-react";

import { AdminToast } from "@/components/admin/admin-toast";

const uploadButtonClassName =
  "inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm font-medium text-slate-900 transition hover:border-slate-400 hover:bg-slate-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-50 disabled:text-slate-400";

type DocumentStampUploadFormProps = {
  documentRecordId: string;
  removeAction: () => Promise<void>;
  maxStampImageMb: number;
  stampImageDataUrl: string | null;
};

export function DocumentStampUploadForm({
  documentRecordId,
  removeAction,
  maxStampImageMb,
  stampImageDataUrl
}: DocumentStampUploadFormProps) {
  const stampImageId = useId();
  const stampImageInputRef = useRef<HTMLInputElement>(null);
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

  async function uploadSelectedStampImage() {
    const input = stampImageInputRef.current;
    const selectedFile = input?.files?.[0];

    if (!selectedFile || isPending) {
      return;
    }

    const formData = new FormData();
    formData.append("stampImage", selectedFile);

    setIsPending(true);
    try {
      const response = await fetch(`/api/admin/documents/${documentRecordId}/stamp`, {
        method: "POST",
        body: formData
      });

      const payload = (await response.json()) as { message?: string };
      if (!response.ok) {
        throw new Error(payload.message ?? "Muhr tasvirini saqlab bo'lmadi.");
      }

      setToastKind("success");
      setToastMessage(payload.message ?? "Muhr tasviri yuklandi.");
      router.refresh();
    } catch (error) {
      setToastKind("error");
      setToastMessage(error instanceof Error ? error.message : "Muhr tasvirini saqlab bo'lmadi.");
    } finally {
      if (input) {
        input.value = "";
      }
      setIsPending(false);
    }
  }

  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      {toastMessage && toastKind ? <AdminToast kind={toastKind} message={toastMessage} /> : null}

      <div className="space-y-2">
        <p className="flex items-center gap-2 text-sm font-medium text-slate-900">
          <Stamp aria-hidden className="h-4 w-4 text-slate-500" />
          Muhr / seal tasviri
        </p>
        <p className="text-sm leading-6 text-slate-600">
          Ommaviy tasdiqlash sahifasi uchun bitta PNG, JPG, JPEG yoki WEBP
          tasvir yuklang. Yangi tasvir yuklansa, joriy muhr almashtiriladi.
        </p>
      </div>

      {stampImageDataUrl ? (
        <div className="group relative flex justify-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-5">
          <form
            action={removeAction}
            className="absolute right-2 top-2"
            onSubmit={(event) => {
              if (!window.confirm("Joriy muhrni olib tashlamoqchimisiz?")) {
                event.preventDefault();
              }
            }}
          >
            <button
              aria-label="Muhrni olib tashlash"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-500 shadow-sm transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
              title="Muhrni olib tashlash"
              type="submit"
            >
              <Trash2 aria-hidden className="h-4 w-4" />
            </button>
          </form>
          <Image
            alt="Joriy muhr yoki seal"
            className="max-h-40 w-auto max-w-full object-contain"
            height={160}
            unoptimized
            src={stampImageDataUrl}
            width={320}
          />
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm leading-6 text-slate-500">
          Hali muhr tasviri yuklanmagan.
        </div>
      )}

      <div className="space-y-3">
        <input
          ref={stampImageInputRef}
          className="sr-only"
          id={stampImageId}
          name="stampImage"
          type="file"
          accept="image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp"
          onChange={() => {
            void uploadSelectedStampImage();
          }}
        />

        <button
          className={uploadButtonClassName}
          disabled={isPending}
          type="button"
          onClick={() => stampImageInputRef.current?.click()}
        >
          <Upload aria-hidden className="h-4 w-4" />
          {isPending
            ? "Yuklanmoqda..."
            : stampImageDataUrl
              ? "Muhrni almashtirish"
              : "Muhrni yuklash"}
        </button>

        <p className="text-xs leading-5 text-slate-500">
          Ruxsat etilgan fayllar: PNG, JPG, JPEG, WEBP. Maksimal hajm: {maxStampImageMb} MB.
        </p>
      </div>
    </section>
  );
}

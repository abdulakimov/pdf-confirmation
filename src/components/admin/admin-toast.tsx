"use client";

import { useEffect, useState } from "react";

type ToastKind = "success" | "error" | "info";

type AdminToastProps = {
  kind?: ToastKind;
  message: string;
};

const toastStyles: Record<ToastKind, string> = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-900",
  error: "border-rose-200 bg-rose-50 text-rose-900",
  info: "border-slate-200 bg-slate-900 text-white"
};

export function AdminToast({ kind = "success", message }: AdminToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(false), 4000);
    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <div
      aria-live="polite"
      className={`fixed right-4 top-4 z-50 max-w-sm rounded-2xl border px-4 py-3 text-sm shadow-lg ${toastStyles[kind]}`}
      role="status"
    >
      <div className="flex items-start gap-3">
        <p className="flex-1 leading-6">{message}</p>
        <button
          aria-label="Yopish"
          className="text-current opacity-70 transition hover:opacity-100"
          type="button"
          onClick={() => setVisible(false)}
        >
          ×
        </button>
      </div>
    </div>
  );
}

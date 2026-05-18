"use client";

import { useState } from "react";
import { CheckCheck, Copy } from "lucide-react";

type CopyToClipboardButtonProps = {
  value: string;
  label?: string;
  copiedLabel?: string;
};

export function CopyToClipboardButton({
  value,
  label = "Havolani nusxalash",
  copiedLabel = "Nusxalandi"
}: CopyToClipboardButtonProps) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-900 transition hover:bg-slate-100"
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
      }}
      type="button"
    >
      {copied ? (
        <CheckCheck aria-hidden className="h-3.5 w-3.5" />
      ) : (
        <Copy aria-hidden className="h-3.5 w-3.5" />
      )}
      {copied ? copiedLabel : label}
    </button>
  );
}

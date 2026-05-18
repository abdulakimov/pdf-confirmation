"use client";

import { useState } from "react";

type CopyToClipboardButtonProps = {
  value: string;
  label?: string;
  copiedLabel?: string;
};

export function CopyToClipboardButton({
  value,
  label = "Copy URL",
  copiedLabel = "Copied"
}: CopyToClipboardButtonProps) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      className="inline-flex items-center rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-900 transition hover:bg-slate-100"
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
      }}
      type="button"
    >
      {copied ? copiedLabel : label}
    </button>
  );
}
import { cn } from "@/lib/utils";
import type { DocumentRecord } from "@prisma/client";

const statusStyles: Record<DocumentRecord["status"], string> = {
  DRAFT: "border-slate-200 bg-slate-50 text-slate-700",
  VERIFIED: "border-emerald-200 bg-emerald-50 text-emerald-700",
  REVOKED: "border-rose-200 bg-rose-50 text-rose-700",
  EXPIRED: "border-amber-200 bg-amber-50 text-amber-700"
};

export function DocumentStatusBadge({ status }: { status: DocumentRecord["status"] }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium uppercase tracking-[0.18em]",
        statusStyles[status]
      )}
    >
      {status.toLowerCase()}
    </span>
  );
}
"use client";

import type { DocumentRecord } from "@prisma/client";

import { useId } from "react";
import { BadgeCheck, Ban, Clock3, RotateCcw, TriangleAlert } from "lucide-react";

const actionButtonClassName =
  "inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60";

type PublishAction = () => Promise<void>;
type RevokeAction = (formData: FormData) => Promise<void>;

type DocumentStatusActionsProps = {
  status: DocumentRecord["status"];
  publishAction: PublishAction;
  revokeAction: RevokeAction;
  expireAction: PublishAction;
  returnToDraftAction: PublishAction;
};

export function DocumentStatusActions({
  status,
  publishAction,
  revokeAction,
  expireAction,
  returnToDraftAction
}: DocumentStatusActionsProps) {
  const revokeReasonId = useId();
  const isDraft = status === "DRAFT";
  const isVerified = status === "VERIFIED";
  const isRevoked = status === "REVOKED";
  const isExpired = status === "EXPIRED";

  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <p className="text-sm font-medium text-slate-900">Holat amallari</p>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Hujjat holatini e&apos;lon qilish, bekor qilish, muddati tugagan deb
          belgilash yoki qoralamaga qaytarish mumkin.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <form action={publishAction}>
          <button
            className={`${actionButtonClassName} border border-emerald-200 bg-emerald-600 text-white hover:bg-emerald-700 ${isVerified ? "opacity-70" : ""}`}
            type="submit"
          >
            <BadgeCheck aria-hidden className="h-4 w-4" />
            {isDraft ? "E'lon qilish" : "Qayta e'lon qilish"}
          </button>
        </form>

        <form action={expireAction}>
          <button
            className={`${actionButtonClassName} border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100 ${isExpired ? "opacity-70" : ""}`}
            type="submit"
          >
            <Clock3 aria-hidden className="h-4 w-4" />
            Muddati tugagan
          </button>
        </form>

        <form action={returnToDraftAction}>
          <button
            className={`${actionButtonClassName} border border-slate-200 bg-slate-50 text-slate-900 hover:bg-slate-100 ${isDraft ? "opacity-70" : ""}`}
            type="submit"
          >
            <RotateCcw aria-hidden className="h-4 w-4" />
            Qoralamaga qaytarish
          </button>
        </form>
      </div>

      <form
        action={revokeAction}
        className="space-y-3 rounded-2xl border border-rose-200 bg-rose-50/70 p-4"
        onSubmit={(event) => {
          if (!window.confirm("Hujjatni bekor qilishni tasdiqlaysizmi?")) {
            event.preventDefault();
          }
        }}
      >
        <div className="space-y-1">
          <p className="flex items-center gap-2 text-sm font-medium text-rose-900">
            <TriangleAlert aria-hidden className="h-4 w-4" />
            Bekor qilish
          </p>
          <p className="text-sm leading-6 text-rose-800">
            Bekor qilishdan oldin ixtiyoriy sabab kiriting. Bu sabab audit
            yozuvida saqlanadi.
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-rose-900" htmlFor={revokeReasonId}>
            Bekor qilish sababi
          </label>
          <textarea
            className="min-h-24 w-full rounded-lg border border-rose-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-rose-500"
            id={revokeReasonId}
            name="revokedReason"
            placeholder="Masalan: hujjat qayta ko'rib chiqilmoqda"
          />
        </div>

        <button
          className={`${actionButtonClassName} border border-rose-200 bg-rose-600 text-white hover:bg-rose-700 ${isRevoked ? "opacity-70" : ""}`}
          type="submit"
        >
          <Ban aria-hidden className="h-4 w-4" />
          Bekor qilish
        </button>
      </form>
    </section>
  );
}

import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { FileText, Plus } from "lucide-react";

import { DocumentRecordsTable } from "@/components/admin";
import { auth } from "@/lib/auth/auth";
import { listDocumentRecords } from "@/server/services";

export default async function HomePage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session || session.user.role !== "admin") {
    redirect("/admin/login");
  }

  const records = await listDocumentRecords();

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="flex items-center gap-2 text-sm font-medium text-slate-500">
            <FileText aria-hidden className="h-4 w-4" />
            Hujjatlarni boshqarish
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">
            Hujjatlar ro&apos;yxati
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Hujjatlar ro&apos;yxatini boshqaring. PDF yuklash, holat amallari va QR boshqaruvi tahrirlash sahifasida davom etadi.
          </p>
        </div>
        <Link
          className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
          href="/admin/documents/new"
        >
          <Plus aria-hidden className="h-4 w-4" />
          Yangi hujjat
        </Link>
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {records.length > 0 ? (
          <DocumentRecordsTable records={records} />
        ) : (
          <div className="p-8 text-sm text-slate-600">
            Hozircha hujjatlar yo&apos;q. Tasdiqlash metama&apos;lumotlarini boshqarishni
            boshlash uchun birinchi hujjatni yarating.
          </div>
        )}
      </div>
    </main>
  );
}

import Link from "next/link";

import { logoutAction } from "@/server/actions/auth";

export default function AdminDashboardPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl items-center justify-center px-6 py-12">
      <section className="w-full rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
          Admin dashboard
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">
          Document management foundation is ready.
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-6 text-slate-600">
          Use the document records page to manage metadata. Uploads, QR codes,
          and the public verification UI will be added later.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            className="inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
            href="/admin/documents"
          >
            Open documents
          </Link>
          <form action={logoutAction}>
            <button
              className="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-50"
              type="submit"
            >
              Log out
            </button>
          </form>
          <Link
            className="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-50"
            href="/"
          >
            Back home
          </Link>
        </div>
      </section>
    </main>
  );
}
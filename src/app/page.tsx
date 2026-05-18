import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center justify-center px-6">
      <section className="w-full rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
          Document Verification Platform
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">
          Foundation scaffold is ready.
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-6 text-slate-600">
          The admin workflow and public verification UI will be built in later
          slices. For now, this home page points to the temporary admin
          placeholder.
        </p>
        <div className="mt-6">
          <Link
            className="inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
            href="/admin"
          >
            Open admin placeholder
          </Link>
        </div>
      </section>
    </main>
  );
}


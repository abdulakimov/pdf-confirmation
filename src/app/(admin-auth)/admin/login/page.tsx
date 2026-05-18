import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { LogIn } from "lucide-react";

import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { auth } from "@/lib/auth/auth";

export default async function AdminLoginPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (session && session.user.role === "admin") {
    redirect("/admin");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl items-center justify-center px-6 py-12">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="flex items-center gap-2 text-sm font-medium text-slate-500">
          <LogIn aria-hidden className="h-4 w-4" />
          Admin kirish
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">
          Cheklangan admin kirish
        </h1>
        <p className="mt-4 text-sm leading-6 text-slate-600">
          Hujjatlarni tasdiqlash paneliga kirish uchun admin akkaunti bilan tizimga kiring.
        </p>
        <div className="mt-6">
          <AdminLoginForm />
        </div>
      </section>
    </main>
  );
}

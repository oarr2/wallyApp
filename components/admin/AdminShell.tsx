import type React from "react";
import { AppNavigation } from "@/components/navigation/AppNavigation";
import { Badge } from "@/components/ui/badge";
import type { AppRole } from "@/lib/auth/authorization";

export function AdminShell({
  role,
  currentPath,
  title,
  description,
  children
}: {
  role: AppRole;
  currentPath: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <AppNavigation role={role} currentPath={currentPath} />
      <section className="mx-auto max-w-6xl space-y-5 px-4 py-5 sm:px-6 lg:px-8">
        <header className="space-y-3">
          <Badge className="border-lime-300 bg-lime-300 text-slate-950">
            Administración
          </Badge>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold">{title}</h1>
            <p className="max-w-3xl text-sm leading-6 text-slate-300">{description}</p>
          </div>
        </header>
        {children}
      </section>
    </main>
  );
}

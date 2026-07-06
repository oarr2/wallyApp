import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <section className="mx-auto flex min-h-[70vh] max-w-3xl flex-col justify-center gap-6">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase text-emerald-700">
            Wally App
          </p>
          <h1 className="text-3xl font-semibold text-slate-950 sm:text-5xl">
            Previsualizaciones estáticas de interfaz
          </h1>
          <p className="max-w-2xl text-base leading-7 text-slate-600">
            Revisa tres direcciones visuales móviles antes de implementar lógica
            de reservas, pagos, administración o torneos.
          </p>
        </div>
        <Button asChild className="h-12 w-fit">
          <a href="/design-preview">
            Ver opciones
            <ArrowRight className="ml-2 h-4 w-4" />
          </a>
        </Button>
      </section>
    </main>
  );
}

import type React from "react";
import { ArrowRight, CalendarDays, Dumbbell, ShieldCheck, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-white sm:px-6 lg:px-8">
      <section className="mx-auto flex min-h-[70vh] max-w-5xl flex-col justify-center gap-6">
        <div className="rounded-lg border border-lime-300/20 bg-slate-900 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.35)] sm:p-7">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-4">
              <Badge className="border-lime-300 bg-lime-300 text-slate-950">
                Wally App MVP
              </Badge>
              <div className="space-y-3">
                <h1 className="text-3xl font-semibold text-white sm:text-5xl">
                  Reserva canchas con una experiencia deportiva moderna
                </h1>
                <p className="text-sm leading-6 text-slate-300 sm:text-base">
                  Base visual mobile-first en español para el MVP: fondo oscuro,
                  tarjetas fuertes, acciones verde neón y torneos anunciados
                  solo como próximamente.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <Metric label="Canchas" value="2" />
              <Metric label="Móvil" value="320" />
              <Metric label="Idioma" value="ES" />
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_320px]">
          <section className="rounded-lg border border-lime-300/20 bg-slate-900 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs text-slate-300">Inicio del MVP</p>
                <h2 className="mt-1 text-2xl font-semibold text-white">
                  Buscar disponibilidad
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Este placeholder prepara la entrada pública y autenticada sin
                  conectar base de datos, autenticación ni lógica de reservas.
                </p>
              </div>
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-lime-300/30 bg-lime-300/10 text-lime-300">
                <CalendarDays className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Button asChild className="bg-lime-300 text-slate-950 hover:bg-lime-200">
                <a href="/design-preview">
                  Ver prototipo visual
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
              <Button variant="outline" className="bg-white text-slate-950">
                Próximamente reservas
              </Button>
            </div>
          </section>

          <section className="rounded-lg border border-lime-300/40 bg-slate-950 p-4 shadow-[0_0_36px_rgba(190,242,100,0.18)]">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-3">
                <Badge className="border-lime-300 bg-lime-300 text-slate-950">
                  Próximamente
                </Badge>
                <div>
                  <h2 className="text-2xl font-semibold text-white">Torneos</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    Muy pronto podrás inscribir equipos, ver fixtures,
                    posiciones y resultados.
                  </p>
                </div>
              </div>
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-lime-300/30 bg-lime-300/10 text-lime-300">
                <Trophy className="h-6 w-6" />
              </div>
            </div>
            <Button className="mt-4 w-full bg-lime-300 text-slate-950 hover:bg-lime-200">
              Ver próximamente
            </Button>
          </section>
        </div>

        <div className="grid gap-3 text-sm text-slate-200 sm:grid-cols-2">
          <Feature icon={Dumbbell} text="Diseño de app deportiva moderna" />
          <Feature icon={ShieldCheck} text="Sin i18n, auth, base de datos ni lógica real todavía" />
        </div>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-lime-300/20 bg-slate-800 p-3">
      <p className="text-xs text-slate-300">{label}</p>
      <p className="mt-1 text-xl font-semibold text-lime-300">{value}</p>
    </div>
  );
}

function Feature({
  icon: Icon,
  text
}: {
  icon: React.ComponentType<{ className?: string }>;
  text: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-lime-300/20 bg-slate-900 p-3">
      <Icon className="h-4 w-4 text-lime-300" />
      <span>{text}</span>
    </div>
  );
}

import { CalendarDays, ListChecks, Medal, ShieldAlert, Trophy, Users } from "lucide-react";
import { TORNEOS_PLACEHOLDER_COPY } from "@/components/navigation/torneos-copy";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const icons = [Users, CalendarDays, Medal, ListChecks] as const;

export default function TorneosPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-white sm:px-6 lg:px-8">
      <section className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          <div className="rounded-lg border border-lime-300/20 bg-slate-900 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.35)] sm:p-7">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="max-w-3xl space-y-4">
                <Badge className="border-lime-300 bg-lime-300 text-slate-950">
                  {TORNEOS_PLACEHOLDER_COPY.eyebrow}
                </Badge>
                <div className="space-y-3">
                  <h1 className="text-4xl font-semibold text-white sm:text-5xl">
                    {TORNEOS_PLACEHOLDER_COPY.title}
                  </h1>
                  <p className="text-sm leading-6 text-slate-300 sm:text-base">
                    {TORNEOS_PLACEHOLDER_COPY.pageLead}
                  </p>
                </div>
              </div>
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md border border-lime-300/30 bg-lime-300/10 text-lime-300">
                <Trophy className="h-7 w-7" />
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {TORNEOS_PLACEHOLDER_COPY.capabilities.map((item, index) => {
              const Icon = icons[index];

              return (
                <Card key={item.title} className="border-lime-300/20 bg-slate-900 text-white">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-lime-300/30 bg-lime-300/10 text-lime-300">
                        <Icon className="h-5 w-5" />
                      </div>
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-6 text-slate-300">{item.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <aside className="space-y-4">
          <Card className="border-lime-300/30 bg-slate-900 text-white">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-md border border-lime-300/30 bg-lime-300/10 text-lime-300">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs uppercase text-slate-400">
                    {TORNEOS_PLACEHOLDER_COPY.informationalLabel}
                  </p>
                  <CardTitle className="text-xl">Sin acciones activas</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-6 text-slate-300">
              <p>{TORNEOS_PLACEHOLDER_COPY.shortDescription}</p>
              <p>{TORNEOS_PLACEHOLDER_COPY.guardrail}</p>
            </CardContent>
          </Card>
        </aside>
      </section>
    </main>
  );
}

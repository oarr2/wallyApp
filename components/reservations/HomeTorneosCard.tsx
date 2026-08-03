import { Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export function HomeTorneosCard() {
  return (
    <Card className="border-lime-300/40 bg-slate-950 text-white shadow-[0_0_36px_rgba(190,242,100,0.18)]">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3">
            <Badge className="border-lime-300 bg-lime-300 text-slate-950">
              Próximamente
            </Badge>
            <div>
              <CardTitle className="text-2xl">Torneos</CardTitle>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Muy pronto podrás inscribir equipos, ver fixtures, posiciones y
                resultados.
              </p>
            </div>
          </div>
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-lime-300/30 bg-lime-300/10 text-lime-300">
            <Trophy className="h-6 w-6" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-slate-400">
          Esta tarjeta solo anuncia el módulo futuro; no inicia registros ni
          gestiona torneos.
        </p>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full bg-lime-300 text-slate-950 hover:bg-lime-200">
          <a href="/torneos">Ver próximamente</a>
        </Button>
      </CardFooter>
    </Card>
  );
}

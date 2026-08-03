import { ArrowRight, Dumbbell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export type CourtCardProps = {
  name: string;
  description?: string | null;
  sports: string[];
  href: string;
};

export function CourtCard({ name, description, sports, href }: CourtCardProps) {
  return (
    <Card className="border-lime-300/20 bg-slate-900 text-white">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase text-slate-400">Cancha disponible</p>
            <CardTitle className="mt-1 text-xl">{name}</CardTitle>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-md border border-lime-300/30 bg-lime-300/10 text-lime-300">
            <Dumbbell className="h-5 w-5" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm leading-6 text-slate-300">
          {description ?? "Lista para reservar turnos de wally."}
        </p>
        <div className="flex flex-wrap gap-2">
          {sports.map((sport) => (
            <Badge key={sport} className="border-lime-300/30 bg-lime-300/10 text-lime-200">
              {sport}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full bg-lime-300 text-slate-950 hover:bg-lime-200">
          <a href={href}>
            Reservar cancha
            <ArrowRight className="h-4 w-4" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}

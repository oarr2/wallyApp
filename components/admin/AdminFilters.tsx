import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

export function AdminFilters({
  actionPath,
  query,
  status,
  courtId,
  courts = []
}: {
  actionPath: string;
  query?: string;
  status?: string;
  courtId?: string;
  courts?: Array<{ id: string; name: string }>;
}) {
  return (
    <form
      action={actionPath}
      className="grid gap-3 rounded-lg border border-lime-300/20 bg-slate-900 p-4 sm:grid-cols-[minmax(0,1fr)_180px_180px_auto]"
    >
      <div className="space-y-2">
        <Label htmlFor="buscar">Buscar</Label>
        <Input
          id="buscar"
          name="buscar"
          defaultValue={query}
          placeholder="Jugador, cancha o código"
          className="border-slate-700 bg-slate-950 text-white"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="estado">Estado</Label>
        <Select name="estado" defaultValue={status ?? "TODAS"}>
          <SelectTrigger id="estado" className="border-slate-700 bg-slate-950 text-white">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="TODAS">Todas</SelectItem>
            <SelectItem value="CONFIRMED">Confirmadas</SelectItem>
            <SelectItem value="CANCELLED">Canceladas</SelectItem>
            <SelectItem value="EXPIRED">Expiradas</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="cancha">Cancha</Label>
        <Select name="cancha" defaultValue={courtId ?? "TODAS"}>
          <SelectTrigger id="cancha" className="border-slate-700 bg-slate-950 text-white">
            <SelectValue placeholder="Cancha" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="TODAS">Todas</SelectItem>
            {courts.map((court) => (
              <SelectItem key={court.id} value={court.id}>
                {court.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button className="self-end bg-lime-300 text-slate-950 hover:bg-lime-200">
        <Filter className="h-4 w-4" />
        Filtrar
      </Button>
    </form>
  );
}

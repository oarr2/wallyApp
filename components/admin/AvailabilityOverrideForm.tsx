import { Ban, Save } from "lucide-react";
import { AvailabilityOverrideType } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AvailabilityOverrideForm({
  courts,
  action
}: {
  courts: Array<{ id: string; name: string }>;
  action: (formData: FormData) => Promise<void>;
}) {
  return (
    <Card className="border-lime-300/20 bg-slate-900 text-white">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Ban className="h-5 w-5 text-lime-300" />
          <CardTitle className="text-xl">Bloquear disponibilidad</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <form action={action} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="courtId">Cancha</Label>
            <select
              id="courtId"
              name="courtId"
              className="h-11 w-full rounded-md border border-slate-700 bg-slate-950 px-3 text-sm text-white"
            >
              {courts.map((court) => (
                <option key={court.id} value={court.id}>
                  {court.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Tipo</Label>
            <select
              id="type"
              name="type"
              defaultValue={AvailabilityOverrideType.BLOCKED}
              className="h-11 w-full rounded-md border border-slate-700 bg-slate-950 px-3 text-sm text-white"
            >
              <option value={AvailabilityOverrideType.BLOCKED}>Bloqueo parcial</option>
              <option value={AvailabilityOverrideType.CLOSED_DAY}>Día cerrado</option>
              <option value={AvailabilityOverrideType.OPEN_EXTRA}>Horario extra</option>
            </select>
          </div>
          <Field label="Fecha" name="localDate" type="date" />
          <Field label="Inicio" name="startLocalTime" type="time" defaultValue="08:00" />
          <Field label="Fin" name="endLocalTime" type="time" defaultValue="09:00" />
          <Field label="Motivo" name="reason" type="text" defaultValue="Bloqueo administrativo" />
          <Button className="bg-lime-300 text-slate-950 hover:bg-lime-200 lg:col-span-3">
            <Save className="h-4 w-4" />
            Guardar disponibilidad
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function Field({
  label,
  name,
  type,
  defaultValue
}: {
  label: string;
  name: string;
  type: string;
  defaultValue?: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={name === "localDate"}
        className="border-slate-700 bg-slate-950 text-white"
      />
    </div>
  );
}

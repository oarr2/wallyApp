import { Clock, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

export function ScheduleRuleForm({
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
          <Clock className="h-5 w-5 text-lime-300" />
          <CardTitle className="text-xl">Nuevo horario</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <form action={action} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <SelectNative label="Cancha" name="courtId" options={courts.map((court) => ({ value: court.id, label: court.name }))} />
          <SelectNative label="Día" name="dayOfWeek" options={days.map((day, index) => ({ value: String(index), label: day }))} />
          <Field label="Inicio" name="startLocalTime" type="time" defaultValue="08:00" />
          <Field label="Fin" name="endLocalTime" type="time" defaultValue="22:00" />
          <Field label="Minutos por turno" name="slotMinutes" type="number" defaultValue="60" />
          <Field label="Corte de cancelación" name="cancellationCutoffMinutes" type="number" defaultValue="120" />
          <label className="flex min-h-11 items-center gap-3 rounded-md border border-slate-700 bg-slate-950 px-3 text-sm">
            <input name="isActive" type="checkbox" defaultChecked className="h-4 w-4" />
            Activo
          </label>
          <Button className="bg-lime-300 text-slate-950 hover:bg-lime-200 lg:col-span-3">
            <Save className="h-4 w-4" />
            Guardar horario
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function SelectNative({
  label,
  name,
  options
}: {
  label: string;
  name: string;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <select
        id={name}
        name={name}
        className="h-11 w-full rounded-md border border-slate-700 bg-slate-950 px-3 text-sm text-white"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
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
  defaultValue: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        className="border-slate-700 bg-slate-950 text-white"
      />
    </div>
  );
}

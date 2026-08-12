import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CourtForm({
  venueId,
  sports,
  action
}: {
  venueId: string;
  sports: Array<{ id: string; name: string }>;
  action: (formData: FormData) => Promise<void>;
}) {
  return (
    <Card className="border-lime-300/20 bg-slate-900 text-white">
      <CardHeader>
        <CardTitle className="text-xl">Nueva cancha</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={action} className="grid gap-3 sm:grid-cols-2">
          <input type="hidden" name="venueId" value={venueId} />
          <Field label="Nombre" name="name" placeholder="Cancha central" />
          <Field label="Orden" name="displayOrder" type="number" defaultValue="1" />
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="description">Descripción</Label>
            <Input
              id="description"
              name="description"
              placeholder="Superficie, iluminación o referencia"
              className="border-slate-700 bg-slate-950 text-white"
            />
          </div>
          <label className="flex min-h-11 items-center gap-3 rounded-md border border-slate-700 bg-slate-950 px-3 text-sm">
            <input name="isActive" type="checkbox" defaultChecked className="h-4 w-4" />
            Activa
          </label>
          <div className="space-y-2">
            <p className="text-sm font-medium">Deportes</p>
            <div className="grid gap-2">
              {sports.map((sport) => (
                <label
                  key={sport.id}
                  className="flex min-h-11 items-center gap-3 rounded-md border border-slate-700 bg-slate-950 px-3 text-sm"
                >
                  <input name="sportIds" type="checkbox" value={sport.id} defaultChecked />
                  {sport.name}
                </label>
              ))}
            </div>
          </div>
          <Button className="bg-lime-300 text-slate-950 hover:bg-lime-200 sm:col-span-2">
            <Save className="h-4 w-4" />
            Guardar cancha
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  defaultValue
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  defaultValue?: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="border-slate-700 bg-slate-950 text-white"
      />
    </div>
  );
}

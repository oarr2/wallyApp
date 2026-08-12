import { AdminShell, AvailabilityOverrideForm, ResponsiveAdminList } from "@/components/admin";
import { Badge } from "@/components/ui/badge";
import { updateAvailabilityOverrideAction } from "@/lib/actions/admin";
import { requireAdminProfile } from "@/lib/auth/authorization";
import { requireAuthContext } from "@/lib/auth/session";
import { listAdminAvailabilityOverrides } from "@/lib/data/availability";
import { listAdminCourts } from "@/lib/data/courts";

export default async function AdminAvailabilityPage() {
  const context = await requireAuthContext();
  requireAdminProfile(context.profile);
  const [courts, overrides] = await Promise.all([
    listAdminCourts({ actor: context.profile }),
    listAdminAvailabilityOverrides({ actor: context.profile })
  ]);

  async function saveAvailability(formData: FormData) {
    "use server";
    await updateAvailabilityOverrideAction(null, formData);
  }

  return (
    <AdminShell
      role={context.profile.role}
      currentPath="/admin/disponibilidad"
      title="Disponibilidad"
      description="Bloquea turnos, cierra días completos o agrega horarios especiales."
    >
      <AvailabilityOverrideForm courts={courts} action={saveAvailability} />
      <ResponsiveAdminList
        items={overrides}
        getItemKey={(override) => override.id}
        emptyMessage="No hay ajustes de disponibilidad."
        columns={[
          { key: "cancha", header: "Cancha", cell: (override) => override.court.name },
          { key: "fecha", header: "Fecha", cell: (override) => override.localDate.toISOString().slice(0, 10) },
          { key: "tipo", header: "Tipo", cell: (override) => typeLabel(override.type) },
          { key: "horario", header: "Horario", cell: (override) => formatRange(override.startLocalTime, override.endLocalTime) },
          { key: "motivo", header: "Motivo", cell: (override) => override.reason ?? "Sin motivo" }
        ]}
        renderCard={(override) => (
          <article key={override.id} className="rounded-lg border border-lime-300/20 bg-slate-900 p-4 text-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{override.court.name}</p>
                <p className="mt-1 text-slate-300">{override.localDate.toISOString().slice(0, 10)}</p>
              </div>
              <Badge className="bg-slate-800 text-slate-100">{typeLabel(override.type)}</Badge>
            </div>
            <p className="mt-3 text-slate-300">{formatRange(override.startLocalTime, override.endLocalTime)}</p>
            <p className="mt-2 text-slate-400">{override.reason ?? "Sin motivo"}</p>
          </article>
        )}
      />
    </AdminShell>
  );
}

function typeLabel(type: string) {
  if (type === "BLOCKED") return "Bloqueado";
  if (type === "CLOSED_DAY") return "Día cerrado";
  return "Horario extra";
}

function formatRange(start: Date | null, end: Date | null) {
  if (!start || !end) return "Día completo";
  return `${start.toISOString().slice(11, 16)}-${end.toISOString().slice(11, 16)}`;
}

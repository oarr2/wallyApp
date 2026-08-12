import { AdminShell, ResponsiveAdminList, ScheduleRuleForm } from "@/components/admin";
import { Badge } from "@/components/ui/badge";
import { updateScheduleRuleAction } from "@/lib/actions/admin";
import { requireAdminProfile } from "@/lib/auth/authorization";
import { requireAuthContext } from "@/lib/auth/session";
import { listAdminCourts } from "@/lib/data/courts";
import { listAdminScheduleRules } from "@/lib/data/schedules";

const days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

export default async function AdminSchedulesPage() {
  const context = await requireAuthContext();
  requireAdminProfile(context.profile);
  const [courts, rules] = await Promise.all([
    listAdminCourts({ actor: context.profile }),
    listAdminScheduleRules({ actor: context.profile })
  ]);

  async function saveSchedule(formData: FormData) {
    "use server";
    await updateScheduleRuleAction(null, formData);
  }

  return (
    <AdminShell
      role={context.profile.role}
      currentPath="/admin/horarios"
      title="Horarios"
      description="Configura reglas recurrentes, duración de turnos y corte de cancelación."
    >
      <ScheduleRuleForm courts={courts} action={saveSchedule} />
      <ResponsiveAdminList
        items={rules}
        getItemKey={(rule) => rule.id}
        emptyMessage="No hay horarios registrados."
        columns={[
          { key: "cancha", header: "Cancha", cell: (rule) => rule.court.name },
          { key: "dia", header: "Día", cell: (rule) => days[rule.dayOfWeek] },
          { key: "horario", header: "Horario", cell: (rule) => `${formatTime(rule.startLocalTime)}-${formatTime(rule.endLocalTime)}` },
          { key: "turno", header: "Turno", cell: (rule) => `${rule.slotMinutes} min` },
          { key: "estado", header: "Estado", cell: (rule) => <Badge className="bg-slate-800 text-slate-100">{rule.isActive ? "Activo" : "Inactivo"}</Badge> }
        ]}
        renderCard={(rule) => (
          <article key={rule.id} className="rounded-lg border border-lime-300/20 bg-slate-900 p-4 text-sm">
            <p className="font-semibold">{rule.court.name}</p>
            <p className="mt-2 text-slate-300">
              {days[rule.dayOfWeek]} · {formatTime(rule.startLocalTime)}-{formatTime(rule.endLocalTime)}
            </p>
            <p className="mt-2 text-slate-400">{rule.slotMinutes} min por turno</p>
          </article>
        )}
      />
    </AdminShell>
  );
}

function formatTime(date: Date) {
  return date.toISOString().slice(11, 16);
}

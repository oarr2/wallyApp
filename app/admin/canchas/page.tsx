import { AdminShell, CourtForm, ResponsiveAdminList } from "@/components/admin";
import { Badge } from "@/components/ui/badge";
import { updateCourtAction } from "@/lib/actions/admin";
import { requireAdminProfile } from "@/lib/auth/authorization";
import { requireAuthContext } from "@/lib/auth/session";
import { listAdminCourts, listActiveSports } from "@/lib/data/courts";

export default async function AdminCourtsPage() {
  const context = await requireAuthContext();
  requireAdminProfile(context.profile);
  const courts = await listAdminCourts({ actor: context.profile });
  const sports = await listActiveSports();
  const venueId = context.profile.venueId ?? courts[0]?.venueId;

  async function saveCourt(formData: FormData) {
    "use server";
    await updateCourtAction(null, formData);
  }

  return (
    <AdminShell
      role={context.profile.role}
      currentPath="/admin/canchas"
      title="Canchas"
      description="Administra canchas, actividad y deportes disponibles dentro de tu alcance."
    >
      {venueId ? <CourtForm venueId={venueId} sports={sports} action={saveCourt} /> : null}
      <ResponsiveAdminList
        items={courts}
        getItemKey={(court) => court.id}
        emptyMessage="No hay canchas registradas."
        columns={[
          { key: "nombre", header: "Nombre", cell: (court) => court.name },
          { key: "orden", header: "Orden", cell: (court) => court.displayOrder },
          {
            key: "estado",
            header: "Estado",
            cell: (court) => <Badge className="bg-slate-800 text-slate-100">{court.isActive ? "Activa" : "Inactiva"}</Badge>
          },
          {
            key: "deportes",
            header: "Deportes",
            cell: (court) => court.courtSports.map((item) => item.sport.name).join(", ")
          }
        ]}
        renderCard={(court) => (
          <article key={court.id} className="rounded-lg border border-lime-300/20 bg-slate-900 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{court.name}</p>
                <p className="mt-1 text-sm text-slate-300">Orden {court.displayOrder}</p>
              </div>
              <Badge className="bg-slate-800 text-slate-100">{court.isActive ? "Activa" : "Inactiva"}</Badge>
            </div>
            <p className="mt-3 text-sm text-slate-300">
              {court.courtSports.map((item) => item.sport.name).join(", ")}
            </p>
          </article>
        )}
      />
    </AdminShell>
  );
}

import {
  AdminFilters,
  AdminReservationDetail,
  AdminReservationList,
  AdminShell
} from "@/components/admin";
import { ReservationStatus } from "@prisma/client";
import { adminCancelReservationAction } from "@/lib/actions/admin";
import { requireAdminProfile } from "@/lib/auth/authorization";
import { requireAuthContext } from "@/lib/auth/session";
import { getAdminReservationDetail, listAdminReservations } from "@/lib/data/admin-reservations";
import { listAdminCourts } from "@/lib/data/courts";

type AdminReservationsPageProps = {
  searchParams?: Promise<{
    buscar?: string;
    estado?: string;
    cancha?: string;
    reserva?: string;
  }>;
};

export default async function AdminReservationsPage({
  searchParams
}: AdminReservationsPageProps) {
  const context = await requireAuthContext();
  requireAdminProfile(context.profile);
  const params = (await searchParams) ?? {};
  const courtId = params.cancha && params.cancha !== "TODAS" ? params.cancha : null;
  const status = reservationStatusFromFilter(params.estado ?? null);
  const [courts, reservations] = await Promise.all([
    listAdminCourts({ actor: context.profile }),
    listAdminReservations({
      actor: context.profile,
      filters: {
        query: params.buscar,
        courtId,
        status
      }
    })
  ]);
  const selectedReservationId = params.reserva ?? reservations[0]?.id;
  const selectedReservation = selectedReservationId
    ? await getAdminReservationDetail({
        reservationId: selectedReservationId,
        actor: context.profile
      })
    : null;

  async function cancelReservation(formData: FormData) {
    "use server";
    await adminCancelReservationAction(null, formData);
  }

  return (
    <AdminShell
      role={context.profile.role}
      currentPath="/admin/reservas"
      title="Reservas"
      description="Busca reservas, revisa el detalle y cancela con motivo auditable cuando sea necesario."
    >
      <AdminFilters
        actionPath="/admin/reservas"
        query={params.buscar}
        status={status}
        courtId={courtId ?? undefined}
        courts={courts}
      />
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
        <AdminReservationList reservations={reservations} />
        <AdminReservationDetail
          reservation={selectedReservation}
          cancelAction={cancelReservation}
        />
      </div>
    </AdminShell>
  );
}

function reservationStatusFromFilter(value: string | null): ReservationStatus | "TODAS" {
  if (
    value === ReservationStatus.CONFIRMED ||
    value === ReservationStatus.CANCELLED ||
    value === ReservationStatus.EXPIRED
  ) {
    return value;
  }

  return "TODAS";
}

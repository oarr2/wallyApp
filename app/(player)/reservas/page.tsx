import { AppNavigation } from "@/components/navigation/AppNavigation";
import { ReservationCard } from "@/components/reservations";
import { requireAuthContext } from "@/lib/auth/session";
import { listPlayerUpcomingReservations } from "@/lib/data/reservations";

type ReservasPageProps = {
  searchParams?: Promise<{ mensaje?: string }>;
};

export default async function ReservasPage({ searchParams }: ReservasPageProps) {
  const context = await requireAuthContext();
  const params = (await searchParams) ?? {};
  const reservations = await listPlayerUpcomingReservations({ actor: context.profile });

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <AppNavigation role={context.profile.role} currentPath="/reservas" />
      <section className="mx-auto max-w-5xl space-y-5 px-4 py-5 sm:px-6 lg:px-8">
        <div className="space-y-2">
          <p className="text-sm text-lime-300">Mis reservas</p>
          <h1 className="text-3xl font-semibold">Próximos turnos</h1>
          <p className="text-sm leading-6 text-slate-300">
            Revisa tus reservas confirmadas y su estado de pago.
          </p>
        </div>
        {params.mensaje ? (
          <div className="rounded-lg border border-lime-300/30 bg-lime-300/10 p-4 text-sm text-lime-100">
            {params.mensaje}
          </div>
        ) : null}
        {reservations.length === 0 ? (
          <div className="rounded-lg border border-slate-700 bg-slate-900 p-5 text-sm text-slate-300">
            No tienes reservas próximas. Elige una cancha para asegurar tu turno.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {reservations.map((reservation) => (
              <ReservationCard
                key={reservation.id}
                id={reservation.id}
                courtName={reservation.court.name}
                sportName={reservation.sport.name}
                localDate={reservation.localDate.toISOString().slice(0, 10)}
                startLocalTime={reservation.startLocalTime.toISOString().slice(11, 19)}
                endLocalTime={reservation.endLocalTime.toISOString().slice(11, 19)}
                paymentStatus={reservation.paymentStatus}
                href={`/reservas/${reservation.id}`}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

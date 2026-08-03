import { redirect } from "next/navigation";
import { AppNavigation } from "@/components/navigation/AppNavigation";
import {
  CourtCard,
  CourtDateSelector,
  HomeTorneosCard,
  SlotPicker
} from "@/components/reservations";
import { createReservationAction } from "@/lib/actions/reservations";
import { requireAuthContext } from "@/lib/auth/session";
import {
  listAvailableSlots,
  listReservableCourtOptions
} from "@/lib/data/reservations";
import { dateToLocalDateString } from "@/lib/time/la-paz";

type ReservarPageProps = {
  searchParams?: Promise<{
    courtId?: string;
    sportId?: string;
    fecha?: string;
    mensaje?: string;
  }>;
};

export default async function ReservarPage({ searchParams }: ReservarPageProps) {
  const context = await requireAuthContext();
  const params = (await searchParams) ?? {};
  const courtOptions = await listReservableCourtOptions();
  const selectedCourt = courtOptions.find((court) => court.id === params.courtId) ?? courtOptions[0];
  const selectedDate = params.fecha ?? dateToLocalDateString(new Date());
  const selectedSportId = params.sportId ?? selectedCourt?.sportId;
  const slots =
    selectedCourt && selectedSportId
      ? await listAvailableSlots({
          courtId: selectedCourt.id,
          sportId: selectedSportId,
          localDate: selectedDate
        })
      : [];

  async function updateSelection(formData: FormData) {
    "use server";

    const courtId = String(formData.get("courtId") ?? "");
    const sportId = String(formData.get("sportId") ?? "");
    const fecha = String(formData.get("localDate") ?? "");
    redirect(`/reservar?courtId=${courtId}&sportId=${sportId}&fecha=${fecha}`);
  }

  async function reserveSlot(formData: FormData) {
    "use server";

    const result = await createReservationAction(null, formData);
    const message = encodeURIComponent(result.message);

    if (result.ok && result.reservationId) {
      redirect(`/reservas/${result.reservationId}?mensaje=${message}`);
    }

    redirect(`/reservar?mensaje=${message}`);
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <AppNavigation role={context.profile.role} currentPath="/reservar" />
      <section className="mx-auto grid max-w-6xl gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:px-8">
        <div className="space-y-5">
          <div className="space-y-2">
            <p className="text-sm text-lime-300">Reservas</p>
            <h1 className="text-3xl font-semibold">Elige tu cancha y horario</h1>
            <p className="text-sm leading-6 text-slate-300">
              Selecciona una fecha disponible. La reserva queda confirmada con
              pago pendiente.
            </p>
          </div>
          {params.mensaje ? (
            <div className="rounded-lg border border-amber-300/30 bg-amber-950/30 p-4 text-sm text-amber-100">
              {params.mensaje}
            </div>
          ) : null}
          {courtOptions.length === 0 ? (
            <div className="rounded-lg border border-slate-700 bg-slate-900 p-5 text-sm text-slate-300">
              No hay canchas activas para reservar en este momento.
            </div>
          ) : (
            <>
              <form action={updateSelection}>
                <CourtDateSelector
                  courts={courtOptions}
                  selectedCourtId={selectedCourt?.id}
                  selectedDate={selectedDate}
                />
                <button className="mt-3 min-h-11 rounded-md bg-lime-300 px-4 text-sm font-semibold text-slate-950">
                  Ver horarios
                </button>
              </form>
              <SlotPicker
                action={reserveSlot}
                slots={slots}
                courtId={selectedCourt.id}
                sportId={selectedSportId}
                localDate={selectedDate}
              />
            </>
          )}
        </div>
        <aside className="space-y-4">
          {courtOptions.slice(0, 2).map((court) => (
            <CourtCard
              key={`${court.id}-${court.sportId}`}
              name={court.name}
              description={court.description}
              sports={[court.sportName]}
              href={`/reservar?courtId=${court.id}&sportId=${court.sportId}&fecha=${selectedDate}`}
            />
          ))}
          <HomeTorneosCard />
        </aside>
      </section>
    </main>
  );
}

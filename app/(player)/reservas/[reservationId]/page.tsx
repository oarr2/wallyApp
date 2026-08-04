import { notFound } from "next/navigation";
import { AppNavigation } from "@/components/navigation/AppNavigation";
import { PaymentHistoryList, PaymentStatusBadge, getPaymentStatusMeta } from "@/components/payments";
import { ReservationCard } from "@/components/reservations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cancelReservationAction } from "@/lib/actions/reservations";
import { requireAuthContext } from "@/lib/auth/session";
import { listPaymentHistoryForReservation } from "@/lib/data/payments";
import { getReservationForActor } from "@/lib/data/reservations";

type ReservationDetailPageProps = {
  params: Promise<{ reservationId: string }>;
  searchParams?: Promise<{ mensaje?: string }>;
};

export default async function ReservationDetailPage({
  params,
  searchParams
}: ReservationDetailPageProps) {
  const context = await requireAuthContext();
  const { reservationId } = await params;
  const query = (await searchParams) ?? {};
  const reservation = await getReservationForActor({
    reservationId,
    actor: context.profile
  });

  if (!reservation) {
    notFound();
  }

  const paymentHistory = await listPaymentHistoryForReservation({
    reservationId,
    actor: context.profile
  });
  const paymentMeta = getPaymentStatusMeta(reservation.paymentStatus);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <AppNavigation role={context.profile.role} currentPath="/reservas" />
      <section className="mx-auto max-w-3xl space-y-5 px-4 py-5 sm:px-6 lg:px-8">
        <div className="space-y-2">
          <p className="text-sm text-lime-300">Detalle de reserva</p>
          <h1 className="text-3xl font-semibold">Tu turno confirmado</h1>
          <p className="text-sm leading-6 text-slate-300">
            El pago aparece como pendiente hasta que administración lo confirme.
          </p>
        </div>
        {query.mensaje ? (
          <div className="rounded-lg border border-lime-300/30 bg-lime-300/10 p-4 text-sm text-lime-100">
            {query.mensaje}
          </div>
        ) : null}
        <ReservationCard
          id={reservation.id}
          courtName={reservation.court.name}
          sportName={reservation.sport.name}
          localDate={reservation.localDate.toISOString().slice(0, 10)}
          startLocalTime={reservation.startLocalTime.toISOString().slice(11, 19)}
          endLocalTime={reservation.endLocalTime.toISOString().slice(11, 19)}
          paymentStatus={reservation.paymentStatus}
        />
        <Card className="border-lime-300/20 bg-slate-900 text-white">
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase text-slate-400">Estado de pago</p>
                <CardTitle className="mt-1 text-xl">{paymentMeta.label}</CardTitle>
              </div>
              <PaymentStatusBadge status={reservation.paymentStatus} />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-6 text-slate-300">
              {paymentMeta.description}
            </p>
          </CardContent>
        </Card>
        <PaymentHistoryList payments={paymentHistory} />
        <form
          action={cancelReservationAction}
          className="rounded-lg border border-red-300/20 bg-slate-900 p-4"
        >
          <input type="hidden" name="reservationId" value={reservation.id} />
          <label className="text-sm font-semibold text-slate-200" htmlFor="reason">
            Motivo de cancelación
          </label>
          <textarea
            id="reason"
            name="reason"
            className="mt-2 min-h-24 w-full rounded-md border border-slate-700 bg-slate-950 p-3 text-sm text-white"
            placeholder="Opcional"
          />
          <Button className="mt-3 bg-red-600 text-white hover:bg-red-500">
            Cancelar reserva
          </Button>
        </form>
      </section>
    </main>
  );
}

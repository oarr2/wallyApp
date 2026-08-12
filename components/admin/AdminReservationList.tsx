import type { PaymentStatus, ReservationStatus } from "@prisma/client";
import { CalendarClock } from "lucide-react";
import { PaymentStatusBadge } from "@/components/payments";
import { Badge } from "@/components/ui/badge";
import { ResponsiveAdminList } from "@/components/admin/ResponsiveAdminList";

export type AdminReservationListItem = {
  id: string;
  localDate: Date;
  startLocalTime: Date;
  endLocalTime: Date;
  status: ReservationStatus;
  paymentStatus: PaymentStatus;
  court: { name: string };
  sport: { name: string };
  player: { displayName: string };
};

export function AdminReservationList({ reservations }: { reservations: AdminReservationListItem[] }) {
  return (
    <ResponsiveAdminList
      items={reservations}
      getItemKey={(reservation) => reservation.id}
      emptyMessage="No hay reservas para los filtros seleccionados."
      columns={[
        { key: "jugador", header: "Jugador", cell: (item) => item.player.displayName },
        { key: "cancha", header: "Cancha", cell: (item) => item.court.name },
        { key: "fecha", header: "Fecha", cell: (item) => formatDate(item.localDate) },
        { key: "horario", header: "Horario", cell: (item) => `${formatTime(item.startLocalTime)}-${formatTime(item.endLocalTime)}` },
        { key: "estado", header: "Estado", cell: (item) => <ReservationStatusBadge status={item.status} /> },
        { key: "pago", header: "Pago", cell: (item) => <PaymentStatusBadge status={item.paymentStatus} /> }
      ]}
      renderCard={(reservation) => (
        <article
          key={reservation.id}
          className="rounded-lg border border-lime-300/20 bg-slate-900 p-4 text-sm text-slate-100"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold">{reservation.player.displayName}</p>
              <p className="mt-1 text-slate-300">{reservation.court.name}</p>
            </div>
            <CalendarClock className="h-5 w-5 text-lime-300" />
          </div>
          <p className="mt-3 text-slate-300">
            {formatDate(reservation.localDate)} · {formatTime(reservation.startLocalTime)}-{formatTime(reservation.endLocalTime)}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <ReservationStatusBadge status={reservation.status} />
            <PaymentStatusBadge status={reservation.paymentStatus} />
          </div>
        </article>
      )}
    />
  );
}

function ReservationStatusBadge({ status }: { status: ReservationStatus }) {
  const label = status === "CONFIRMED" ? "Confirmada" : status === "CANCELLED" ? "Cancelada" : "Expirada";
  return <Badge className="border-slate-600 bg-slate-800 text-slate-100">{label}</Badge>;
}

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function formatTime(date: Date) {
  return date.toISOString().slice(11, 16);
}

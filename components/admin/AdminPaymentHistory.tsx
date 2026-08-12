import type { PaymentSource, PaymentStatus } from "@prisma/client";
import { CreditCard } from "lucide-react";
import { PaymentStatusBadge } from "@/components/payments";
import { ResponsiveAdminList } from "@/components/admin/ResponsiveAdminList";

export type AdminPaymentHistoryItem = {
  id: string;
  status: PaymentStatus;
  source: PaymentSource;
  reason: string | null;
  amount: unknown;
  currency: string;
  createdAt: Date;
  reservation: {
    id: string;
    court: { name: string };
    player: { displayName: string };
  };
};

export function AdminPaymentHistory({ payments }: { payments: AdminPaymentHistoryItem[] }) {
  return (
    <ResponsiveAdminList
      items={payments}
      getItemKey={(payment) => payment.id}
      emptyMessage="No hay movimientos de pago dentro del alcance permitido."
      columns={[
        { key: "jugador", header: "Jugador", cell: (item) => item.reservation.player.displayName },
        { key: "cancha", header: "Cancha", cell: (item) => item.reservation.court.name },
        { key: "estado", header: "Estado", cell: (item) => <PaymentStatusBadge status={item.status} /> },
        { key: "origen", header: "Origen", cell: (item) => sourceLabel(item.source) },
        { key: "fecha", header: "Fecha", cell: (item) => formatDateTime(item.createdAt) },
        { key: "motivo", header: "Motivo", cell: (item) => item.reason ?? "Sin motivo" }
      ]}
      renderCard={(payment) => (
        <article
          key={payment.id}
          className="rounded-lg border border-lime-300/20 bg-slate-900 p-4 text-sm text-slate-100"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold">{payment.reservation.player.displayName}</p>
              <p className="mt-1 text-slate-300">{payment.reservation.court.name}</p>
            </div>
            <CreditCard className="h-5 w-5 text-lime-300" />
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <PaymentStatusBadge status={payment.status} />
            <span className="text-xs text-slate-400">{sourceLabel(payment.source)}</span>
          </div>
          <p className="mt-3 text-slate-300">{payment.reason ?? "Sin motivo"}</p>
          <time className="mt-2 block text-xs text-slate-400">
            {formatDateTime(payment.createdAt)}
          </time>
        </article>
      )}
    />
  );
}

function sourceLabel(source: PaymentSource) {
  if (source === "MANUAL") {
    return "Manual";
  }

  if (source === "EVENT") {
    return "Evento";
  }

  return "Sistema";
}

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("es-BO", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/La_Paz"
  }).format(date);
}

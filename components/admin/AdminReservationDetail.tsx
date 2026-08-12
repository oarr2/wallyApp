import type { PaymentStatus, ReservationStatus } from "@prisma/client";
import { XCircle } from "lucide-react";
import { PaymentStatusBadge } from "@/components/payments";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export type AdminReservationDetailItem = {
  id: string;
  localDate: Date;
  startLocalTime: Date;
  endLocalTime: Date;
  status: ReservationStatus;
  paymentStatus: PaymentStatus;
  cancellationReason: string | null;
  court: { name: string };
  sport: { name: string };
  player: { displayName: string; phone: string | null };
};

export function AdminReservationDetail({
  reservation,
  cancelAction
}: {
  reservation: AdminReservationDetailItem | null;
  cancelAction: (formData: FormData) => Promise<void>;
}) {
  if (!reservation) {
    return (
      <Card className="border-slate-700 bg-slate-900 text-white">
        <CardContent className="p-4 text-sm text-slate-300">
          Selecciona una reserva para revisar el detalle.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-lime-300/20 bg-slate-900 text-white">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase text-slate-400">Detalle</p>
            <CardTitle className="mt-1 text-xl">{reservation.player.displayName}</CardTitle>
          </div>
          <PaymentStatusBadge status={reservation.paymentStatus} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-slate-300">
        <dl className="grid gap-3 sm:grid-cols-2">
          <Item label="Cancha" value={reservation.court.name} />
          <Item label="Deporte" value={reservation.sport.name} />
          <Item label="Fecha" value={reservation.localDate.toISOString().slice(0, 10)} />
          <Item
            label="Horario"
            value={`${reservation.startLocalTime.toISOString().slice(11, 16)}-${reservation.endLocalTime.toISOString().slice(11, 16)}`}
          />
          <Item label="Teléfono" value={reservation.player.phone ?? "No registrado"} />
          <Item label="Estado" value={reservation.status === "CONFIRMED" ? "Confirmada" : "Cancelada"} />
        </dl>
        {reservation.status === "CONFIRMED" ? (
          <form action={cancelAction} className="rounded-lg border border-red-300/20 bg-slate-950 p-3">
            <input type="hidden" name="reservationId" value={reservation.id} />
            <Label htmlFor="reason">Motivo de auditoría</Label>
            <textarea
              id="reason"
              name="reason"
              required
              minLength={3}
              className="mt-2 min-h-24 w-full rounded-md border border-slate-700 bg-slate-950 p-3 text-sm text-white"
              placeholder="Ej. Mantenimiento de emergencia"
            />
            <Button className="mt-3 bg-red-600 text-white hover:bg-red-500">
              <XCircle className="h-4 w-4" />
              Cancelar reserva
            </Button>
          </form>
        ) : (
          <p className="rounded-lg border border-slate-700 bg-slate-950 p-3">
            Motivo: {reservation.cancellationReason ?? "Sin motivo registrado"}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase text-slate-500">{label}</dt>
      <dd className="mt-1 text-slate-100">{value}</dd>
    </div>
  );
}

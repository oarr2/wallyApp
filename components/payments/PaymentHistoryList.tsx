import type { PaymentStatus } from "@prisma/client";
import { CreditCard, History } from "lucide-react";
import { PaymentStatusBadge } from "@/components/payments/PaymentStatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type PaymentHistoryItem = {
  id: string;
  status: PaymentStatus;
  source: "MANUAL" | "EVENT" | "SYSTEM";
  sourceReference: string | null;
  reason: string | null;
  amount: unknown;
  currency: string;
  createdAt: Date;
};

export function PaymentHistoryList({ payments }: { payments: PaymentHistoryItem[] }) {
  return (
    <Card className="border-lime-300/20 bg-slate-900 text-white">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-md border border-lime-300/30 bg-lime-300/10 text-lime-300">
            <History className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs uppercase text-slate-400">Pagos</p>
            <CardTitle className="text-xl">Historial de pago</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {payments.length === 0 ? (
          <div className="rounded-lg border border-slate-700 bg-slate-950 p-4 text-sm text-slate-300">
            Todavía no hay movimientos de pago registrados para esta reserva.
          </div>
        ) : (
          <ol className="space-y-3">
            {payments.map((payment) => (
              <li
                key={payment.id}
                className="rounded-lg border border-slate-700 bg-slate-950 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-2">
                    <PaymentStatusBadge status={payment.status} />
                    <p className="flex items-center gap-2 text-sm text-slate-300">
                      <CreditCard className="h-4 w-4 text-lime-300" />
                      {formatSource(payment.source)}
                      {payment.sourceReference ? ` · ${payment.sourceReference}` : ""}
                    </p>
                  </div>
                  <time className="text-right text-xs text-slate-400">
                    {formatDateTime(payment.createdAt)}
                  </time>
                </div>
                {payment.reason ? (
                  <p className="mt-3 text-sm leading-6 text-slate-300">
                    {payment.reason}
                  </p>
                ) : null}
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}

function formatSource(source: PaymentHistoryItem["source"]) {
  if (source === "MANUAL") {
    return "Ajuste manual";
  }

  if (source === "EVENT") {
    return "Evento de pago";
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

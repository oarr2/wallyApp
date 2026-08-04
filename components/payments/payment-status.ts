import { PaymentStatus } from "@prisma/client";

export type PaymentStatusTone = "warning" | "success" | "danger" | "info";

export const paymentStatusMeta = {
  [PaymentStatus.PENDING]: {
    label: "Pendiente",
    description: "El pago todavía no fue confirmado.",
    tone: "warning",
    className: "border-amber-200 bg-amber-100 text-amber-900"
  },
  [PaymentStatus.PAID]: {
    label: "Pagado",
    description: "El pago fue confirmado para esta reserva.",
    tone: "success",
    className: "border-emerald-200 bg-emerald-100 text-emerald-900"
  },
  [PaymentStatus.FAILED]: {
    label: "Fallido",
    description: "El pago falló o fue rechazado.",
    tone: "danger",
    className: "border-red-200 bg-red-100 text-red-900"
  },
  [PaymentStatus.REFUNDED]: {
    label: "Reembolsado",
    description: "El pago fue devuelto.",
    tone: "info",
    className: "border-sky-200 bg-sky-100 text-sky-900"
  }
} as const satisfies Record<
  PaymentStatus,
  {
    label: string;
    description: string;
    tone: PaymentStatusTone;
    className: string;
  }
>;

export function getPaymentStatusMeta(status: PaymentStatus) {
  return paymentStatusMeta[status];
}

export function getPaymentStatusLabel(status: PaymentStatus): string {
  return getPaymentStatusMeta(status).label;
}

export function canTransitionPaymentStatus(
  currentStatus: PaymentStatus,
  nextStatus: PaymentStatus
): boolean {
  if (currentStatus === nextStatus) {
    return true;
  }

  if (currentStatus === PaymentStatus.REFUNDED) {
    return false;
  }

  if (nextStatus === PaymentStatus.REFUNDED) {
    return currentStatus === PaymentStatus.PAID;
  }

  return true;
}

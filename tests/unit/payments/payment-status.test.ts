import { PaymentStatus } from "@prisma/client";
import { describe, expect, it } from "vitest";
import {
  canTransitionPaymentStatus,
  getPaymentStatusLabel,
  paymentStatusMeta
} from "@/components/payments/payment-status";

describe("estados de pago", () => {
  it("expone etiquetas españolas para todos los estados soportados", () => {
    expect(getPaymentStatusLabel(PaymentStatus.PENDING)).toBe("Pendiente");
    expect(getPaymentStatusLabel(PaymentStatus.PAID)).toBe("Pagado");
    expect(getPaymentStatusLabel(PaymentStatus.FAILED)).toBe("Fallido");
    expect(getPaymentStatusLabel(PaymentStatus.REFUNDED)).toBe("Reembolsado");
  });

  it("define tratamiento visual para cada estado", () => {
    expect(Object.keys(paymentStatusMeta).sort()).toEqual(
      [
        PaymentStatus.FAILED,
        PaymentStatus.PAID,
        PaymentStatus.PENDING,
        PaymentStatus.REFUNDED
      ].sort()
    );
    expect(paymentStatusMeta.PENDING.tone).toBe("warning");
    expect(paymentStatusMeta.PAID.tone).toBe("success");
    expect(paymentStatusMeta.FAILED.tone).toBe("danger");
    expect(paymentStatusMeta.REFUNDED.tone).toBe("info");
  });

  it("permite reembolso solo desde un pago confirmado", () => {
    expect(canTransitionPaymentStatus(PaymentStatus.PAID, PaymentStatus.REFUNDED)).toBe(
      true
    );
    expect(
      canTransitionPaymentStatus(PaymentStatus.PENDING, PaymentStatus.REFUNDED)
    ).toBe(false);
    expect(canTransitionPaymentStatus(PaymentStatus.REFUNDED, PaymentStatus.PAID)).toBe(
      false
    );
  });
});

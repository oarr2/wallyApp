import { PaymentStatus } from "@prisma/client";
import { z } from "zod";

const paymentStatusSchema = z.enum([
  PaymentStatus.PENDING,
  PaymentStatus.PAID,
  PaymentStatus.FAILED,
  PaymentStatus.REFUNDED
]);

export const adminPaymentStatusUpdateSchema = z.object({
  reservationId: z.string().uuid("Selecciona una reserva válida."),
  status: paymentStatusSchema,
  reason: z.string().trim().min(3, "Ingresa un motivo para el ajuste."),
  amount: z.coerce.number().positive("El monto debe ser positivo.").optional(),
  currency: z.string().trim().length(3, "La moneda debe usar 3 letras.").default("BOB")
});

export const paymentEventSchema = z.object({
  source: z.string().trim().min(1, "La fuente del evento es requerida."),
  sourceEventId: z.string().trim().min(1, "El id del evento es requerido."),
  reservationId: z.string().uuid("Selecciona una reserva válida."),
  status: paymentStatusSchema,
  reason: z.string().trim().optional(),
  occurredAt: z.string().datetime("La fecha del evento debe ser ISO.").optional()
});

export type AdminPaymentStatusUpdateInput = z.infer<
  typeof adminPaymentStatusUpdateSchema
>;
export type PaymentEventInput = z.infer<typeof paymentEventSchema>;

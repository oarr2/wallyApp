import { z } from "zod";

const uuidMessage = "Selecciona una opción válida.";

export const reservationCreateSchema = z
  .object({
    courtId: z.string().uuid(uuidMessage),
    sportId: z.string().uuid(uuidMessage),
    localDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Selecciona una fecha válida."),
    startLocalTime: z
      .string()
      .regex(/^\d{2}:\d{2}(?::\d{2})?$/, "Selecciona una hora de inicio válida."),
    endLocalTime: z
      .string()
      .regex(/^\d{2}:\d{2}(?::\d{2})?$/, "Selecciona una hora de fin válida.")
  })
  .refine((value) => value.startLocalTime < value.endLocalTime, {
    message: "La hora de inicio debe ser anterior a la hora de fin.",
    path: ["endLocalTime"]
  });

export const reservationCancelSchema = z.object({
  reservationId: z.string().uuid("Selecciona una reserva válida."),
  reason: z.string().trim().max(240, "El motivo debe tener 240 caracteres o menos.").optional()
});

export const availableSlotsSchema = reservationCreateSchema
  .pick({
    courtId: true,
    sportId: true,
    localDate: true
  })
  .partial({
    courtId: true,
    sportId: true
  });

export type ReservationCreateInput = z.infer<typeof reservationCreateSchema>;
export type ReservationCancelInput = z.infer<typeof reservationCancelSchema>;
export type AvailableSlotsInput = z.infer<typeof availableSlotsSchema>;

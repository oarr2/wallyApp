import { AvailabilityOverrideType } from "@prisma/client";
import { z } from "zod";

const uuidSchema = z.string().uuid("Debe ser un UUID válido.");
const timeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, "Debe ser una hora válida.");
const localDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Debe ser una fecha local válida.");

export const courtInputSchema = z.object({
  courtId: uuidSchema.optional(),
  venueId: uuidSchema,
  name: z.string().trim().min(2, "Ingresa el nombre de la cancha."),
  description: z.string().trim().nullable().optional(),
  isActive: z.boolean(),
  displayOrder: z.number().int().min(1),
  sportIds: z.array(uuidSchema).min(1, "Selecciona al menos un deporte.")
});

export const scheduleRuleInputSchema = z
  .object({
    scheduleRuleId: uuidSchema.optional(),
    courtId: uuidSchema,
    dayOfWeek: z.number().int().min(0).max(6),
    startLocalTime: timeSchema,
    endLocalTime: timeSchema,
    slotMinutes: z.number().int().positive(),
    cancellationCutoffMinutes: z.number().int().nonnegative(),
    isActive: z.boolean()
  })
  .refine((value) => value.startLocalTime < value.endLocalTime, {
    message: "La hora de inicio debe ser anterior a la hora de fin.",
    path: ["endLocalTime"]
  });

export const availabilityOverrideInputSchema = z
  .object({
    availabilityOverrideId: uuidSchema.optional(),
    courtId: uuidSchema,
    localDate: localDateSchema,
    type: z.enum(AvailabilityOverrideType),
    startLocalTime: timeSchema.optional().nullable(),
    endLocalTime: timeSchema.optional().nullable(),
    reason: z.string().trim().nullable().optional()
  })
  .superRefine((value, context) => {
    if (value.type === AvailabilityOverrideType.CLOSED_DAY) {
      return;
    }

    if (!value.startLocalTime || !value.endLocalTime) {
      context.addIssue({
        code: "custom",
        message: "El ajuste parcial requiere hora de inicio y fin.",
        path: ["startLocalTime"]
      });
      return;
    }

    if (value.startLocalTime >= value.endLocalTime) {
      context.addIssue({
        code: "custom",
        message: "La hora de inicio debe ser anterior a la hora de fin.",
        path: ["endLocalTime"]
      });
    }
  });

export const generatedTimeSlotSchema = z
  .object({
    courtId: uuidSchema,
    localDate: localDateSchema,
    startLocalTime: timeSchema,
    endLocalTime: timeSchema,
    startAtUtc: z.date(),
    endAtUtc: z.date()
  })
  .refine((value) => value.startLocalTime < value.endLocalTime, {
    message: "El turno debe tener inicio anterior al fin.",
    path: ["endLocalTime"]
  })
  .refine((value) => value.startAtUtc < value.endAtUtc, {
    message: "El instante UTC de inicio debe ser anterior al fin.",
    path: ["endAtUtc"]
  });

export type CourtInput = z.infer<typeof courtInputSchema>;
export type ScheduleRuleInput = z.infer<typeof scheduleRuleInputSchema>;
export type AvailabilityOverrideInput = z.infer<
  typeof availabilityOverrideInputSchema
>;
export type GeneratedTimeSlotInput = z.infer<typeof generatedTimeSlotSchema>;

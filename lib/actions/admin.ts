"use server";

import { revalidatePath } from "next/cache";
import { requireAuthContext } from "@/lib/auth/session";
import { adminCancelReservation } from "@/lib/data/admin-reservations";
import { upsertAvailabilityOverrideForAdmin } from "@/lib/data/availability";
import { upsertCourtForAdmin } from "@/lib/data/courts";
import { upsertScheduleRuleForAdmin } from "@/lib/data/schedules";
import {
  availabilityOverrideInputSchema,
  courtInputSchema,
  scheduleRuleInputSchema
} from "@/lib/validation/admin";
import { z } from "zod";

export type AdminActionState = {
  ok: boolean;
  message: string;
};

const requiredReasonSchema = z.object({
  reservationId: z.string().uuid("Reserva inválida."),
  reason: z.string().trim().min(3, "Ingresa un motivo de auditoría.")
});

export async function updateCourtAction(
  _previousState: AdminActionState | null,
  formData: FormData
): Promise<AdminActionState> {
  const context = await requireAuthContext();
  const parsed = courtInputSchema.safeParse({
    courtId: optionalValue(formData.get("courtId")),
    venueId: formData.get("venueId"),
    name: formData.get("name"),
    description: optionalValue(formData.get("description")),
    isActive: formData.get("isActive") === "on" || formData.get("isActive") === "true",
    displayOrder: Number(formData.get("displayOrder")),
    sportIds: formData.getAll("sportIds").map(String)
  });

  if (!parsed.success) {
    return failure(parsed.error.issues[0]?.message, "Revisa los datos de la cancha.");
  }

  try {
    await upsertCourtForAdmin({ ...parsed.data, actor: context.profile });
    revalidatePath("/admin/canchas");
    revalidatePath("/reservar");
    return { ok: true, message: "Cancha guardada correctamente." };
  } catch (error) {
    return failureFromError(error, "No pudimos guardar la cancha.");
  }
}

export async function updateScheduleRuleAction(
  _previousState: AdminActionState | null,
  formData: FormData
): Promise<AdminActionState> {
  const context = await requireAuthContext();
  const parsed = scheduleRuleInputSchema.safeParse({
    scheduleRuleId: optionalValue(formData.get("scheduleRuleId")),
    courtId: formData.get("courtId"),
    dayOfWeek: Number(formData.get("dayOfWeek")),
    startLocalTime: formData.get("startLocalTime"),
    endLocalTime: formData.get("endLocalTime"),
    slotMinutes: Number(formData.get("slotMinutes")),
    cancellationCutoffMinutes: Number(formData.get("cancellationCutoffMinutes")),
    isActive: formData.get("isActive") === "on" || formData.get("isActive") === "true"
  });

  if (!parsed.success) {
    return failure(parsed.error.issues[0]?.message, "Revisa los datos del horario.");
  }

  try {
    await upsertScheduleRuleForAdmin({ ...parsed.data, actor: context.profile });
    revalidatePath("/admin/horarios");
    revalidatePath("/reservar");
    return { ok: true, message: "Horario guardado correctamente." };
  } catch (error) {
    return failureFromError(error, "No pudimos guardar el horario.");
  }
}

export async function updateAvailabilityOverrideAction(
  _previousState: AdminActionState | null,
  formData: FormData
): Promise<AdminActionState> {
  const context = await requireAuthContext();
  const parsed = availabilityOverrideInputSchema.safeParse({
    availabilityOverrideId: optionalValue(formData.get("availabilityOverrideId")),
    courtId: formData.get("courtId"),
    localDate: formData.get("localDate"),
    type: formData.get("type"),
    startLocalTime: optionalValue(formData.get("startLocalTime")),
    endLocalTime: optionalValue(formData.get("endLocalTime")),
    reason: optionalValue(formData.get("reason"))
  });

  if (!parsed.success) {
    return failure(
      parsed.error.issues[0]?.message,
      "Revisa los datos de disponibilidad."
    );
  }

  try {
    await upsertAvailabilityOverrideForAdmin({ ...parsed.data, actor: context.profile });
    revalidatePath("/admin/disponibilidad");
    revalidatePath("/reservar");
    return { ok: true, message: "Disponibilidad guardada correctamente." };
  } catch (error) {
    return failureFromError(error, "No pudimos guardar la disponibilidad.");
  }
}

export async function adminCancelReservationAction(
  _previousState: AdminActionState | null,
  formData: FormData
): Promise<AdminActionState> {
  const context = await requireAuthContext();
  const parsed = requiredReasonSchema.safeParse({
    reservationId: formData.get("reservationId"),
    reason: formData.get("reason")
  });

  if (!parsed.success) {
    return failure(parsed.error.issues[0]?.message, "Ingresa un motivo de auditoría.");
  }

  try {
    await adminCancelReservation({ ...parsed.data, actor: context.profile });
    revalidatePath("/admin/reservas");
    revalidatePath("/reservas");
    return { ok: true, message: "Reserva cancelada por administración." };
  } catch (error) {
    return failureFromError(error, "No pudimos cancelar la reserva.");
  }
}

function optionalValue(value: FormDataEntryValue | null): string | undefined {
  const normalized = String(value ?? "").trim();
  return normalized ? normalized : undefined;
}

function failure(message: string | undefined, fallback: string): AdminActionState {
  return {
    ok: false,
    message: message ?? fallback
  };
}

function failureFromError(error: unknown, fallback: string): AdminActionState {
  return {
    ok: false,
    message: error instanceof Error ? error.message : fallback
  };
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAuthContext } from "@/lib/auth/session";
import {
  cancelReservation,
  createReservation
} from "@/lib/data/reservations";
import {
  reservationCancelSchema,
  reservationCreateSchema
} from "@/lib/validation/reservations";

export type ReservationActionState = {
  ok: boolean;
  message: string;
  reservationId?: string;
};

export async function createReservationAction(
  _previousState: ReservationActionState | null,
  formData: FormData
): Promise<ReservationActionState> {
  const context = await requireAuthContext();
  const parsed = reservationCreateSchema.safeParse({
    courtId: formData.get("courtId"),
    sportId: formData.get("sportId"),
    localDate: formData.get("localDate"),
    startLocalTime: formData.get("startLocalTime"),
    endLocalTime: formData.get("endLocalTime")
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Revisa los datos de la reserva."
    };
  }

  try {
    const reservation = await createReservation({
      ...parsed.data,
      actor: context.profile
    });
    revalidatePath("/reservar");
    revalidatePath("/reservas");

    return {
      ok: true,
      reservationId: reservation.id,
      message: "Reserva creada. Tu pago queda pendiente."
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "No pudimos crear la reserva. Intenta nuevamente."
    };
  }
}

export async function cancelReservationAction(formData: FormData): Promise<never> {
  const context = await requireAuthContext();
  const parsed = reservationCancelSchema.safeParse({
    reservationId: formData.get("reservationId"),
    reason: formData.get("reason") || undefined
  });

  if (!parsed.success) {
    redirect(`/reservas?mensaje=${encodeURIComponent("Reserva inválida.")}`);
  }

  try {
    await cancelReservation({
      ...parsed.data,
      actor: context.profile
    });
    revalidatePath("/reservas");
    redirect(
      `/reservas?mensaje=${encodeURIComponent("Reserva cancelada correctamente.")}`
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "No pudimos cancelar la reserva.";
    redirect(`/reservas/${parsed.data.reservationId}?mensaje=${encodeURIComponent(message)}`);
  }
}

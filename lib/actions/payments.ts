"use server";

import { revalidatePath } from "next/cache";
import { requireAuthContext } from "@/lib/auth/session";
import { updatePaymentStatus } from "@/lib/data/payments";
import { adminPaymentStatusUpdateSchema } from "@/lib/validation/payments";

export type PaymentActionState = {
  ok: boolean;
  message: string;
};

export async function adminUpdatePaymentStatusAction(
  _previousState: PaymentActionState | null,
  formData: FormData
): Promise<PaymentActionState> {
  const context = await requireAuthContext();
  const parsed = adminPaymentStatusUpdateSchema.safeParse({
    reservationId: formData.get("reservationId"),
    status: formData.get("status"),
    reason: formData.get("reason"),
    amount: formData.get("amount") || undefined,
    currency: formData.get("currency") || "BOB"
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Revisa los datos del pago."
    };
  }

  try {
    await updatePaymentStatus({
      ...parsed.data,
      actor: context.profile
    });
    revalidatePath("/reservas");
    revalidatePath(`/reservas/${parsed.data.reservationId}`);
    revalidatePath("/admin/pagos");

    return {
      ok: true,
      message: "Estado de pago actualizado."
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "No pudimos actualizar el estado de pago."
    };
  }
}

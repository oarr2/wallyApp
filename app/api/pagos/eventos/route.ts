import { NextResponse } from "next/server";
import { processPaymentEvent } from "@/lib/data/payments";
import { paymentEventSchema } from "@/lib/validation/payments";

export async function POST(request: Request) {
  const secret = process.env.PAYMENT_EVENT_SECRET;

  if (secret) {
    const authorization = request.headers.get("authorization");

    if (authorization !== `Bearer ${secret}`) {
      return NextResponse.json(
        { message: "Fuente de pago no autorizada." },
        { status: 401 }
      );
    }
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { message: "El cuerpo del evento no es válido." },
      { status: 400 }
    );
  }

  const parsed = paymentEventSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "Evento inválido." },
      { status: 400 }
    );
  }

  try {
    const result = await processPaymentEvent(parsed.data);

    return NextResponse.json({
      message: result.duplicate
        ? "Evento duplicado ignorado correctamente."
        : "Evento de pago procesado.",
      duplicate: result.duplicate
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No pudimos procesar el evento.";
    const status = message.includes("No encontramos") ? 404 : 409;

    return NextResponse.json({ message }, { status });
  }
}

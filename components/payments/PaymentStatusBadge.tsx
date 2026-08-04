import type { PaymentStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { getPaymentStatusMeta } from "@/components/payments/payment-status";
import { cn } from "@/lib/utils";

export function PaymentStatusBadge({
  status,
  className
}: {
  status: PaymentStatus;
  className?: string;
}) {
  const meta = getPaymentStatusMeta(status);

  return <Badge className={cn(meta.className, className)}>{meta.label}</Badge>;
}

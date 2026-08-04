import { CalendarDays, Clock, MapPin } from "lucide-react";
import type { PaymentStatus } from "@prisma/client";
import { PaymentStatusBadge } from "@/components/payments/PaymentStatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type ReservationCardProps = {
  id: string;
  courtName: string;
  sportName: string;
  localDate: string;
  startLocalTime: string;
  endLocalTime: string;
  paymentStatus: PaymentStatus;
  href?: string;
  className?: string;
};

export function ReservationCard({
  id,
  courtName,
  sportName,
  localDate,
  startLocalTime,
  endLocalTime,
  paymentStatus,
  href,
  className
}: ReservationCardProps) {
  return (
    <Card className={cn("border-lime-300/20 bg-slate-900 text-white", className)}>
      <CardHeader className="gap-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase text-slate-400">{sportName}</p>
            <CardTitle className="mt-1 text-xl">{courtName}</CardTitle>
          </div>
          <PaymentStatusBadge status={paymentStatus} />
        </div>
      </CardHeader>
      <CardContent className="grid gap-3 text-sm text-slate-200">
        <p className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-lime-300" />
          {formatLocalDate(localDate)}
        </p>
        <p className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-lime-300" />
          {trimSeconds(startLocalTime)} - {trimSeconds(endLocalTime)}
        </p>
        <p className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-lime-300" />
          Reserva #{id.slice(0, 8)}
        </p>
      </CardContent>
      {href ? (
        <CardFooter>
          <Button asChild className="w-full bg-lime-300 text-slate-950 hover:bg-lime-200">
            <a href={href}>Ver detalle</a>
          </Button>
        </CardFooter>
      ) : null}
    </Card>
  );
}

function trimSeconds(time: string) {
  return time.slice(0, 5);
}

function formatLocalDate(localDate: string) {
  return new Intl.DateTimeFormat("es-BO", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    timeZone: "UTC"
  }).format(new Date(`${localDate}T00:00:00.000Z`));
}
